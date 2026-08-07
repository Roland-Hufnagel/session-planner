package org.example.backend.controller;

import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class AuthControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18");

    @Autowired
    private MockMvc mockMvc;


    @Autowired
    private UserRepository userRepository;

    @Test
    void getMe_prefersStoredAvatar_overGithubProfile() throws Exception {
        String ownAvatar = "https://example.com/pete-in-the-alps.png";
        userRepository.save(User.builder()
                .name("Peter Klein").nickname("Pete").role(Role.COACH)
                .githubName("peterk-stored").email("peterk-stored@neuefische.de")
                .avatarUrl(ownAvatar)
                .build());

        mockMvc.perform(get("/api/auth/me")
                        .with(oauth2Login().attributes(attrs -> {
                            attrs.put("login", "peterk-stored");
                            attrs.put("name", "Peter Klein");
                            attrs.put("avatar_url", "https://avatars.githubusercontent.com/u/1?v=4");
                        })))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").value(ownAvatar));
    }

    @Test
    void getMe_returnsAttributes_whenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .with(oauth2Login().attributes(attrs -> {
                            attrs.put("login", "peterk");
                            attrs.put("name", "Peter Klein");
                            attrs.put("avatar_url", "https://example.com/peterk.png");
                        })))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("peterk"))
                .andExpect(jsonPath("$.name").value("Peter Klein"))
                .andExpect(jsonPath("$.avatarUrl").value("https://example.com/peterk.png"));
    }

    @Test
    void getMe_returnsEmpty_whenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(content().string(""));   // null -> leerer Body
    }

}
