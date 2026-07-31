package org.example.backend.service;

import org.example.backend.dto.UserRequestDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.exception.DuplicateResourceException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Transactional(readOnly = true)
@Service
public class UserService {
    private static final String NO_USER_FOUND = "No user found with id: ";
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponseDto> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserResponseDto::from)
                .toList();
    }

    public UserResponseDto findUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                NO_USER_FOUND + id));
        return UserResponseDto.from(user);
    }

    @Transactional
    public UserResponseDto createUser(UserRequestDto userRequestDto) {

        checkEmailAvailable(userRequestDto.email(), null);
        checkGithubNameAvailable(userRequestDto.githubName(), null);

        User newUser = userRequestDto.toEntity();
        User savedUser = userRepository.save(newUser);
        return UserResponseDto.from(savedUser); // Return the savedUser, not the newUser!
    }

    @Transactional
    public UserResponseDto updateUser(UUID id, UserRequestDto userRequestDto) {
        // first check existence!
        User existingUser = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                NO_USER_FOUND + id));
        // then check duplicates:
        checkEmailAvailable(userRequestDto.email(), id);
        checkGithubNameAvailable(userRequestDto.githubName(), id);

        existingUser.setName(userRequestDto.name());
        existingUser.setNickname(userRequestDto.nickname());
        existingUser.setRole(userRequestDto.role());
        existingUser.setGithubName(userRequestDto.githubName());
        existingUser.setEmail(userRequestDto.email());
        existingUser.setAvatarUrl(userRequestDto.avatarUrl());
        // null = nicht angegeben -> bestehenden Zustand behalten, damit ein
        // Formular ohne active-Feld niemanden versehentlich reaktiviert.
        if (userRequestDto.active() != null) {
            existingUser.setActive(userRequestDto.active());
        }
        User savedUser = userRepository.save(existingUser);
        return UserResponseDto.from(savedUser);
    }

    @Transactional
    public void deleteUserById(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new ResourceNotFoundException(NO_USER_FOUND + id));
        user.setActive(false);
        userRepository.save(user);
    }

    // Helper:

    /**
     * Prueft, ob die Email noch frei ist. Ein deaktivierter User belegt sie
     * weiterhin (die Spalte ist unique), taucht aber in der UI nicht als
     * Konflikt auf – deshalb sagt die Meldung ausdruecklich, woran es liegt.
     *
     * @param excludeId beim Bearbeiten die eigene id, beim Anlegen null
     */
    private void checkEmailAvailable(String email, UUID excludeId) {
        userRepository.findByEmail(email)
                .filter(existingUser -> !existingUser.getId().equals(excludeId))
                .ifPresent(existingUser -> {
                    throw new DuplicateResourceException(existingUser.isActive()
                            ? "Email already exists: " + email
                            : "Email belongs to a deactivated user: " + email);
                });
    }

    private void checkGithubNameAvailable(String githubName, UUID excludeId) {
        userRepository.findByGithubName(githubName)
                .filter(existingUser -> !existingUser.getId().equals(excludeId))
                .ifPresent(existingUser -> {
                    throw new DuplicateResourceException(existingUser.isActive()
                            ? "GithubName already exists: " + githubName
                            : "GithubName belongs to a deactivated user: " +
                              githubName);
                });
    }
}
