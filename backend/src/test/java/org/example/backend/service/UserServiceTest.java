package org.example.backend.service;

import org.example.backend.dto.UserRequestDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.exception.DuplicateUserException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private final UserRepository mockRepo = mock(UserRepository.class);
    private final UserService userService = new UserService(mockRepo);

    // ----- findAllUsers -----
    @Test
    void findAllUsers_returnsListOfDTOs() {
        // given:
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .name("Peter Klein")
                .nickname("Peter K")
                .role(Role.ADMIN)
                .githubName("peterk")
                .email("peterk@neuefische.de")
                .build();
        List<User> userList = List.of(user);
        UserResponseDto userResponseDto = UserResponseDto.from(user);
        List<UserResponseDto> userResponseDtoList = List.of(userResponseDto);
        // when then
        when(mockRepo.findAll()).thenReturn(userList);
        assertThat(userService.findAllUsers()).isEqualTo(userResponseDtoList);
    }

    // ----- findUserById -----
    @Test
    void findUserById_returnsDTO_whenUserExists() {
        // given:
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .name("Peter Klein")
                .nickname("Peter K")
                .role(Role.ADMIN)
                .githubName("peterk")
                .email("peterk@neuefische.de")
                .build();
        // when then
        when(mockRepo.findById(id)).thenReturn(Optional.of(user));
        UserResponseDto result = userService.findUserById(id);
        assertThat(result.id()).isEqualTo(id);
        assertThat(result.githubName()).isEqualTo("peterk");
        assertThat(result.role()).isEqualTo(Role.ADMIN);

    }

    @Test
    void findUserById_throwsUserNotFoundException_whenUserNotExists() {
        // given:
        UUID id = UUID.randomUUID();
        // when then
        // the repo does not throw an exception. It only returns an empty Optional
        when(mockRepo.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.findUserById(id))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining(id.toString());
    }

    // ----- createUser -----
    @Test
    void createUser_savesAndReturnsDto() {
        UserRequestDto requestDTO = new UserRequestDto(
                "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .name(requestDTO.name()).nickname(requestDTO.nickname()).role(requestDTO.role())
                .githubName(requestDTO.githubName()).email(requestDTO.email()).avatarUrl(requestDTO.avatarUrl())
                .build();
        // any(User.class) simulates Hibernate: 'Create a User with id'
        when(mockRepo.save(any(User.class))).thenReturn(savedUser);

        UserResponseDto result = userService.createUser(requestDTO);

        assertThat(result.id()).isEqualTo(savedUser.getId());
        assertThat(result.email()).isEqualTo("peterk@neuefische.de");
        verify(mockRepo).save(any(User.class)); // verify 'save' was called
    }

    @Test
    void createUser_throwsConflict_whenEmailExists() {
        UserRequestDto requestDTO = new UserRequestDto(
                "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockRepo.existsByEmail(requestDTO.email())).thenReturn(true); // mocks that the email is already used

        assertThatThrownBy(() -> userService.createUser(requestDTO))
                .isInstanceOf(DuplicateUserException.class)
                .hasMessageContaining(requestDTO.email());
        verify(mockRepo, never()).save(any()); // verify 'save' was never called (@Transactional)
    }

    @Test
    void createUser_throwsConflict_whenGithubNameExists() {
        UserRequestDto requestDTO = new UserRequestDto(
                "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockRepo.existsByEmail(requestDTO.email())).thenReturn(false); // mocks that the email is 'free'
        when(mockRepo.existsByGithubName(requestDTO.githubName())).thenReturn(true); // mocks that the githubName is already used

        assertThatThrownBy(() -> userService.createUser(requestDTO))
                .isInstanceOf(DuplicateUserException.class)
                .hasMessageContaining(requestDTO.githubName());

        verify(mockRepo, never()).save(any());
    }

    // ----- updateUser -----
    @Test
    void updateUser_updatesAndReturnsDto() {
        UUID id = UUID.randomUUID();
        User existingUser = User.builder()
                .id(id)
                .name("Peter Klein").nickname("Peter K.").role(Role.ADMIN)
                .githubName("peterk").email("peterk@neuefische.de")
                .build();
        UserRequestDto requestDTO = new UserRequestDto(
                "Peter Klein", "Pete", Role.COACH, // nickname and role changed
                "peterk", "peterk@neuefische.de", null);
        when(mockRepo.findById(id)).thenReturn(Optional.of(existingUser));
        when(mockRepo.save(any(User.class))).thenReturn(existingUser);

        UserResponseDto result = userService.updateUser(id, requestDTO);

        assertThat(result.nickname()).isEqualTo("Pete");
        assertThat(result.role()).isEqualTo(Role.COACH);
        verify(mockRepo).save(any(User.class));
    }

    @Test
    void updateUser_throwsNotFound_whenUserDoesNotExist() {
        UUID id = UUID.randomUUID();
        UserRequestDto requestDTO = new UserRequestDto(
                "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockRepo.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(id, requestDTO))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining(id.toString());

        verify(mockRepo, never()).save(any());
    }

    @Test
    void updateUser_throwsConflict_whenEmailBelongsToAnotherUser() {
        UUID id = UUID.randomUUID();
        User existing = User.builder()
                .id(id)
                .name("Peter Klein").nickname("Peter K.").role(Role.ADMIN)
                .githubName("peterk").email("peterk@neuefische.de")
                .build();
        UserRequestDto request = new UserRequestDto(
                "Peter Klein", "Peter K.", Role.ADMIN,
                "peterk", "peterk@neuefische.de", null);
        when(mockRepo.findById(id)).thenReturn(Optional.of(existing));
        when(mockRepo.existsByEmailAndIdNot(request.email(), id)).thenReturn(true); // mocks that the email already exists

        assertThatThrownBy(() -> userService.updateUser(id, request))
                .isInstanceOf(DuplicateUserException.class)
                .hasMessageContaining(request.email());

        verify(mockRepo, never()).save(any());
    }

    // ----- deleteUser -----
    @Test
    void deleteUserById_deletes_whenUserExists() {
        UUID id = UUID.randomUUID();
        when(mockRepo.existsById(id)).thenReturn(true); // mocks that the user exists

        userService.deleteUserById(id);

        verify(mockRepo).deleteById(id); // verify deleteById(id) was called
    }

    @Test
    void deleteUserById_throwsNotFound_whenUserDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(mockRepo.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUserById(id))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining(id.toString());

        verify(mockRepo, never()).deleteById(any(UUID.class)); // verify deleteById was never called
    }

}