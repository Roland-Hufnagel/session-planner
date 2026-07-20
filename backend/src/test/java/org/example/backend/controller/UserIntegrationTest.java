package org.example.backend.controller;

import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class UserIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUp() {
        userRepository.deleteAll(); // Each test starts with empty DB
    }

    // Create-Pfad → bewusst über die echte API (save() umginge die Schreib-Schicht)
    @Test
    void createUser_persistsInDb() throws Exception {
        String body = """
                { "name":"Peter Klein","nickname":"Peter K.","role":"ADMIN",
                  "githubName":"peterk","email":"peterk@neuefische.de","avatarUrl":null }
                """;

        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(body))
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

        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }


}
