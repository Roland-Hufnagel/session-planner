package org.example.backend.controller;

import org.example.backend.dto.UserRequestDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.exception.DuplicateUserException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.model.Role;
import org.example.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService mockUserService;

    // ----- findAllUsers -----
    @Test
    void findAllUsers_returns200AndUserList() throws Exception {
        UserResponseDto userResponseDto = new UserResponseDto(
                UUID.randomUUID(), "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockUserService.findAllUsers()).thenReturn(List.of(userResponseDto));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk()) // 200
                .andExpect(jsonPath("$.length()").value(1)) // We expect a list with one element
                .andExpect(jsonPath("$[0].githubName").value("peterk"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"));
    }

    // ----- findUserById -----
    @Test
    void findUserById_returns200AndUser() throws Exception {
        UUID id = UUID.randomUUID();
        UserResponseDto userResponseDto = new UserResponseDto(
                id, "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockUserService.findUserById(id)).thenReturn(userResponseDto);

        mockMvc.perform(get("/api/users/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.githubName").value("peterk"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void findUserById_returns404_whenUserDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockUserService.findUserById(id))
                .thenThrow(new UserNotFoundException(
                        "No user found with id: " + id));

        mockMvc.perform(get("/api/users/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(
                        "No user found with id: " + id))
                .andExpect(jsonPath("$.validationErrors").doesNotExist());
    }

    // ----- createUser -----
    @Test
    void createUser_returns201AndCreatedUser() throws Exception {
        UUID id = UUID.randomUUID();
        UserResponseDto userResponseDto = new UserResponseDto(
                id, "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockUserService.createUser(any(UserRequestDto.class))).thenReturn(userResponseDto);

        String requestBody = """
                {
                  "name": "Peter Klein",
                  "nickname": "Peter K.",
                  "role": "ADMIN",
                  "githubName": "peterk",
                  "email": "peterk@neuefische.de",
                  "avatarUrl": null
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())                       // 201
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.githubName").value("peterk"));
    }

    @Test
    void createUser_returns400_whenBodyIsInvalid() throws Exception {
        String invalidBody = """
                {
                  "name": "",
                  "nickname": "Peter K.",
                  "role": null,
                  "githubName": "",
                  "email": "not-an-email",
                  "avatarUrl": null
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())                    // 400
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.role").exists())
                .andExpect(jsonPath("$.validationErrors.githubName").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists());

        verify(mockUserService, never()).createUser(any()); // verify service is never reached.
    }

    @Test
    void createUser_returns409_whenEmailAlreadyExists() throws Exception {
        when(mockUserService.createUser(any(UserRequestDto.class)))
                .thenThrow(new DuplicateUserException("Email already exists: peterk@neuefische.de"));

        String requestBody = """
                {
                  "name": "Peter Klein",
                  "nickname": "Peter K.",
                  "role": "ADMIN",
                  "githubName": "peterk",
                  "email": "peterk@neuefische.de",
                  "avatarUrl": null
                }
                """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())                      // 409
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Email already exists: peterk@neuefische.de"))
                .andExpect(jsonPath("$.validationErrors").doesNotExist());
    }

    // ----- updateUser -----
    @Test
    void updateUser_returns200AndUpdatedUser() throws Exception {
        UUID id = UUID.randomUUID();
        UserResponseDto userResponseDto = new UserResponseDto(
                id, "Peter Klein", "Pete", Role.COACH,
                "peterk", "peterk@neuefische.de", null);
        // if one argument is a matcher ('any(UserRequestDto.class)') then all arguments have to be matcher (-> 'eq(id)')
        when(mockUserService.updateUser(eq(id), any(UserRequestDto.class))).thenReturn(userResponseDto);

        String requestBody = """
                {
                  "name": "Peter Klein", "nickname": "Pete", "role": "COACH",
                  "githubName": "peterk", "email": "peterk@neuefische.de", "avatarUrl": null
                }
                """;

        mockMvc.perform(put("/api/users/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("Pete"))
                .andExpect(jsonPath("$.role").value("COACH"));
    }

    @Test
    void updateUser_returns400_whenBodyIsInvalid() throws Exception {
        UUID id = UUID.randomUUID();
        String invalidBody = """
                {
                  "name": "", "nickname": "Pete", "role": null,
                  "githubName": "", "email": "not-an-email", "avatarUrl": null
                }
                """;

        mockMvc.perform(put("/api/users/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.email").exists());

        verify(mockUserService, never()).updateUser(any(), any());
    }

    @Test
    void updateUser_returns404_whenUserDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockUserService.updateUser(eq(id), any(UserRequestDto.class)))
                .thenThrow(new UserNotFoundException(
                        "No user found with id: " + id));

        String requestBody = """
                {
                  "name": "Peter Klein", "nickname": "Pete", "role": "COACH",
                  "githubName": "peterk", "email": "peterk@neuefische.de", "avatarUrl": null
                }
                """;

        mockMvc.perform(put("/api/users/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(
                        "No user found with id: " + id));
    }

    @Test
    void updateUser_returns409_whenEmailBelongsToAnotherUser() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockUserService.updateUser(eq(id), any(UserRequestDto.class)))
                .thenThrow(new DuplicateUserException("Email already exists: peterk@neuefische.de"));

        String requestBody = """
                {
                  "name": "Peter Klein", "nickname": "Pete", "role": "COACH",
                  "githubName": "peterk", "email": "peterk@neuefische.de", "avatarUrl": null
                }
                """;

        mockMvc.perform(put("/api/users/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Email already exists: peterk@neuefische.de"));
    }

    // ----- deleteUser -----
    @Test
    void deleteUserById_returns204_whenUserExists() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNoContent());          // 204

        verify(mockUserService).deleteUserById(id);
    }

    @Test
    void deleteUserById_returns404_whenUserDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        // since deleteUserById does not return anything you can not use 'when(...)'
        // instead use it the other way round:
        doThrow(new UserNotFoundException("No user found with id: " + id))
                .when(mockUserService).deleteUserById(id);

        mockMvc.perform(delete("/api/users/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(
                        "No user found with id: " + id));
    }

}