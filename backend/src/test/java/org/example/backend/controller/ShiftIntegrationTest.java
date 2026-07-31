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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@WithMockUser
class ShiftIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private CohortRepository cohortRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUp() {
        // Reihenfolge zaehlt: shifts.cohort_id ist NOT NULL, also muessen die
        // Kinder vor den Eltern weg.
        shiftRepository.deleteAll();
        cohortRepository.deleteAll();
        userRepository.deleteAll();
    }

    private Cohort seedCohort() {
        return cohortRepository.save(Cohort.builder()
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(LocalDate.of(2026, Month.AUGUST, 3))
                .endDate(LocalDate.of(2027, Month.FEBRUARY, 26))
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build());
    }

    private User seedCoach() {
        return userRepository.save(User.builder()
                .name("Peter Klein").nickname("Pete").role(Role.COACH)
                .githubName("peterk").email("peterk@neuefische.de")
                .build());
    }

    private Shift seedShift(User coach, Cohort cohort) {
        return shiftRepository.save(Shift.builder()
                .title("Morning session").date(LocalDate.of(2026, Month.AUGUST, 5))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 30))
                .coach(coach).cohort(cohort)
                .build());
    }

    private String body(String title, UUID coachId, UUID cohortId) {
        return """
                { "title":"%s", "date":"2026-08-05",
                  "startTime":"09:00", "endTime":"12:30",
                  "coachId":%s, "cohortId":"%s" }
                """.formatted(title,
                coachId == null ? "null" : "\"" + coachId + "\"",
                cohortId);
    }

    @Test
    void createShift_returns403_whenCsrfTokenIsMissing() throws Exception {
        Cohort cohort = seedCohort();

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("No csrf", null, cohort.getId())))
                .andExpect(status().isForbidden());

        assertThat(shiftRepository.count()).isZero();
    }

    /**
     * Der wichtigste Test dieser Klasse: Er prueft nicht die Antwort, sondern den
     * Datenbankzustand danach. Eine fehlende @Transactional-Annotation auf
     * createShift (das Klassen-Level ist readOnly) liefert eine astreine
     * 201-Antwort samt id – und schreibt trotzdem nichts.
     */
    @Test
    void createShift_persistsInDb() throws Exception {
        Cohort cohort = seedCohort();
        User coach = seedCoach();

        mockMvc.perform(post("/api/shifts").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Morning session", coach.getId(), cohort.getId())))
                .andExpect(status().isCreated());

        assertThat(shiftRepository.count()).isEqualTo(1);
    }

    @Test
    void createShift_persistsWithoutCoach() throws Exception {
        Cohort cohort = seedCohort();

        mockMvc.perform(post("/api/shifts").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Unassigned session", null, cohort.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.coach").value(nullValue()));

        assertThat(shiftRepository.count()).isEqualTo(1);
    }

    @Test
    void createShift_returns404_whenCohortDoesNotExist() throws Exception {
        UUID unknownCohortId = UUID.randomUUID();

        mockMvc.perform(post("/api/shifts").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Ghost cohort", null, unknownCohortId)))
                .andExpect(status().isNotFound());

        assertThat(shiftRepository.count()).isZero();
    }

    // Read-Pfad -> Seed direkt via save(), dann ueber die API pruefen.
    // Deckt gleichzeitig ab, dass der @EntityGraph Coach und Cohort mitlaedt:
    // ohne ihn wuerde die Serialisierung an LAZY-Proxies scheitern
    // (spring.jpa.open-in-view=false).
    @Test
    void findShiftsBetween_returnsSeededShiftWithCoachAndCohort() throws Exception {
        Cohort cohort = seedCohort();
        seedShift(seedCoach(), cohort);

        mockMvc.perform(get("/api/shifts")
                        .param("from", "2026-08-03")
                        .param("to", "2026-08-09"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Morning session"))
                .andExpect(jsonPath("$[0].coach.nickname").value("Pete"))
                .andExpect(jsonPath("$[0].cohort.name").value("java-25-3"));
    }

    @Test
    void findShiftsBetween_ignoresShiftsOutsideTheRange() throws Exception {
        Cohort cohort = seedCohort();
        seedShift(seedCoach(), cohort); // liegt am 2026-08-05

        mockMvc.perform(get("/api/shifts")
                        .param("from", "2026-08-10")
                        .param("to", "2026-08-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void updateShift_persistsChangesInDb() throws Exception {
        Cohort cohort = seedCohort();
        Shift shift = seedShift(seedCoach(), cohort);

        mockMvc.perform(put("/api/shifts/{id}", shift.getId()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Renamed session", null, cohort.getId())))
                .andExpect(status().isOk());

        // Auch hier gegen die DB pruefen, nicht gegen die Antwort.
        assertThat(shiftRepository.findById(shift.getId()))
                .isPresent()
                .get()
                .satisfies(updated -> {
                    assertThat(updated.getTitle()).isEqualTo("Renamed session");
                    assertThat(updated.getCoach()).isNull(); // PUT ersetzt vollstaendig
                });
    }

    @Test
    void deleteShiftById_removesFromDb() throws Exception {
        Shift shift = seedShift(seedCoach(), seedCohort());

        mockMvc.perform(delete("/api/shifts/{id}", shift.getId()).with(csrf()))
                .andExpect(status().isNoContent());

        assertThat(shiftRepository.existsById(shift.getId())).isFalse();
    }

}
