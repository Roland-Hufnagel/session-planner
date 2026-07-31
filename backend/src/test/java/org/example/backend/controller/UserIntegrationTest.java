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
class UserIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private CohortRepository cohortRepository;

    @BeforeEach
    void cleanUp() {
        // Each test starts with empty DB. Shifts zuerst: sie referenzieren
        // sowohl users als auch cohorts.
        shiftRepository.deleteAll();
        cohortRepository.deleteAll();
        userRepository.deleteAll();
    }


    @Test
    void createUser_returns403_whenCsrfTokenIsMissing() throws Exception {
        String body = """
                { "name":"Peter Klein","nickname":"Peter K.","role":"ADMIN",
                  "githubName":"peterk","email":"peterk@neuefische.de","avatarUrl":null }
                """;

        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        assertThat(userRepository.findByGithubName("peterk")).isEmpty();
    }
    
    // Create-Pfad → bewusst über die echte API (save() umginge die Schreib-Schicht)
    @Test
    void createUser_persistsInDb() throws Exception {
        String body = """
                { "name":"Peter Klein","nickname":"Peter K.","role":"ADMIN",
                  "githubName":"peterk","email":"peterk@neuefische.de","avatarUrl":null }
                """;

        mockMvc.perform(post("/api/users").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        assertThat(userRepository.findByGithubName("peterk")).isPresent();
    }

    // Read-Pfad → Seed direkt via save(), dann über die API prüfen
    @Test
    void findUserById_returnsSeededUser() throws Exception {
        User user = userRepository.save(User.builder()
                .name("Peter Klein").nickname("Peter K.").role(Role.ADMIN)
                .githubName("peterk").email("peterk@neuefische.de")
                .build());

        mockMvc.perform(get("/api/users/{id}", user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.githubName").value("peterk"));
    }

    @Test
    void createUser_returns409_whenEmailAlreadyExistsInDb() throws Exception {
        userRepository.save(User.builder()
                .name("Peter Klein").nickname("Peter K.").role(Role.ADMIN)
                .githubName("peterk").email("peterk@neuefische.de")
                .build());

        String body = """
                { "name":"Anna Neu","nickname":"Anna","role":"ADMIN",
                  "githubName":"annan","email":"peterk@neuefische.de","avatarUrl":null }
                """;   // gleiche Email, anderer githubName

        mockMvc.perform(post("/api/users").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    /**
     * "Loeschen" eines Coaches ist ein Soft Delete: Der Datensatz bleibt, nur
     * active kippt auf false. Genau deshalb behalten alte Shifts ihre
     * Coach-Zuordnung – wer eine Session gehalten hat, ist auch spaeter noch
     * nachvollziehbar. Ersetzt jemand user.setActive(false) wieder durch
     * deleteById, faellt es nur hier auf.
     */
    @Test
    void deleteUser_deactivatesCoachAndKeepsShiftAssignment() throws Exception {
        User coach = userRepository.save(User.builder()
                .name("Peter Klein").nickname("Pete").role(Role.COACH)
                .githubName("peterk").email("peterk@neuefische.de")
                .build());
        Cohort cohort = cohortRepository.save(Cohort.builder()
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(LocalDate.of(2026, Month.AUGUST, 3)).endDate(LocalDate.of(2027, Month.FEBRUARY, 26))
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build());
        Shift shift = shiftRepository.save(Shift.builder()
                .title("Morning session").date(LocalDate.of(2026, Month.AUGUST, 5))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 30))
                .coach(coach).cohort(cohort)
                .build());

        mockMvc.perform(delete("/api/users/{id}", coach.getId()).with(csrf()))
                .andExpect(status().isNoContent());

        // Der User bleibt in der Tabelle, nur deaktiviert
        assertThat(userRepository.findById(coach.getId()))
                .isPresent()
                .get()
                .satisfies(deactivated -> assertThat(deactivated.isActive()).isFalse());

        // Die Shift bleibt bestehen ...
        assertThat(shiftRepository.existsById(shift.getId())).isTrue();

        // ... und behaelt ihren Coach. Die Pruefung laeuft ueber die API, weil das
        // Repository allein hier einen LAZY-Proxy liefern wuerde (open-in-view=false).
        mockMvc.perform(get("/api/shifts")
                        .param("from", "2026-08-03")
                        .param("to", "2026-08-09"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].coach.id").value(coach.getId().toString()))
                .andExpect(jsonPath("$[0].coach.nickname").value("Pete"))
                .andExpect(jsonPath("$[0].coach.active").value(false));
    }

}
