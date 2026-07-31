package org.example.backend.controller;

import org.example.backend.model.*;
import org.example.backend.repository.CohortRepository;
import org.example.backend.repository.ShiftRepository;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@WithMockUser
class CohortIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CohortRepository cohortRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUp() {
        // Each test starts with empty DB. Reihenfolge zaehlt: shifts.cohort_id ist
        // NOT NULL, die Kinder muessen also vor den Eltern weg.
        shiftRepository.deleteAll();
        cohortRepository.deleteAll();
        userRepository.deleteAll();
    }


    @Test
    void createCohort_returns403_whenCsrfTokenIsMissing() throws Exception {
        String body = """
                { "name":"java-25-3","nickname":"Die Coffeebeans",
                  "startDate":"2025-09-01","endDate":"2026-02-27",
                  "federalState":"HH","department":"JAVA","colorCode":"#D93500" }
                """;

        mockMvc.perform(post("/api/cohorts").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        // CohortRepository hat kein findByName – existsByName reicht für die Persistenz-Prüfung
        assertThat(cohortRepository.existsByName("java-25-3")).isFalse();
    }

    // Create-Pfad → bewusst über die echte API (save() umginge die Schreib-Schicht)
    @Test
    void createCohort_persistsInDb() throws Exception {
        String body = """
                { "name":"java-25-3","nickname":"Die Coffeebeans",
                  "startDate":"2025-09-01","endDate":"2026-02-27",
                  "federalState":"HH","department":"JAVA","colorCode":"#D93500" }
                """;

        mockMvc.perform(post("/api/cohorts").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        assertThat(cohortRepository.existsByName("java-25-3")).isTrue();
    }

    // Read-Pfad → Seed direkt via save(), dann über die API prüfen
    @Test
    void findCohortById_returnsSeededCohort() throws Exception {
        Cohort cohort = cohortRepository.save(Cohort.builder()
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(LocalDate.of(2025, Month.SEPTEMBER, 1)).endDate(LocalDate.of(2026, Month.FEBRUARY, 27))
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build());

        mockMvc.perform(get("/api/cohorts/{id}", cohort.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("java-25-3"))
                .andExpect(jsonPath("$.startDate").value("2025-09-01"));
    }

    @Test
    void createCohort_returns409_whenNameAlreadyExistsInDb() throws Exception {
        cohortRepository.save(Cohort.builder()
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(LocalDate.of(2025, Month.SEPTEMBER, 1)).endDate(LocalDate.of(2026, Month.FEBRUARY, 27))
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build());

        String body = """
                { "name":"java-25-3","nickname":"Die Bohnen",
                  "startDate":"2026-03-01","endDate":"2026-08-28",
                  "federalState":"BE","department":"JAVA","colorCode":"#0057B8" }
                """;   // gleicher Name, alles andere anders

        mockMvc.perform(post("/api/cohorts").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    /**
     * Loeschen einer Cohort nimmt ihre Shifts mit.
     *
     * Das ist eine reine Service-Konvention (erst shiftRepository.deleteByCohortId,
     * dann cohortRepository.deleteById) – dreht jemand die Reihenfolge oder laesst
     * die erste Zeile weg, laeuft das Loeschen in eine FK-Violation und wird zum
     * 500er. Kein Compiler warnt davor, nur dieser Test.
     */
    @Test
    void deleteCohort_alsoDeletesItsShifts() throws Exception {
        Cohort cohort = cohortRepository.save(Cohort.builder()
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(LocalDate.of(2026, Month.AUGUST, 3)).endDate(LocalDate.of(2027, Month.FEBRUARY, 26))
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build());
        User coach = userRepository.save(User.builder()
                .name("Peter Klein").nickname("Pete").role(Role.COACH)
                .githubName("peterk").email("peterk@neuefische.de")
                .build());

        shiftRepository.save(Shift.builder()
                .title("Morning session").date(LocalDate.of(2026, Month.AUGUST, 5))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 30))
                .coach(coach).cohort(cohort)
                .build());
        shiftRepository.save(Shift.builder()   // zweite Shift, bewusst unbesetzt
                .title("Afternoon session").date(LocalDate.of(2026, Month.AUGUST, 5))
                .startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(17, 0))
                .cohort(cohort)
                .build());
        assertThat(shiftRepository.count()).isEqualTo(2);

        mockMvc.perform(delete("/api/cohorts/{id}", cohort.getId()).with(csrf()))
                .andExpect(status().isNoContent());

        assertThat(cohortRepository.existsById(cohort.getId())).isFalse();
        assertThat(shiftRepository.count()).isZero();
        // Der Coach haengt an der Shift, nicht an der Cohort – er bleibt erhalten.
        assertThat(userRepository.existsById(coach.getId())).isTrue();
    }

}
