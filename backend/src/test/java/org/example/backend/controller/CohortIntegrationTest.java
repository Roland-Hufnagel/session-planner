package org.example.backend.controller;

import org.example.backend.model.Cohort;
import org.example.backend.model.Department;
import org.example.backend.model.FederalState;
import org.example.backend.repository.CohortRepository;
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
import java.time.Month;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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

    @BeforeEach
    void cleanUp() {
        cohortRepository.deleteAll(); // Each test starts with empty DB
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


}
