package org.example.backend.service;

//import jakarta.transaction.Transactional;

import org.example.backend.dto.UserRequestDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Transactional(readOnly = true)
@Service
public class UserService {
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
        User user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "No user found with id: " + id));
        return UserResponseDto.from(user);
    }

    @Transactional
    public void deleteUserById(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No user found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponseDto createUser(UserRequestDto userRequestDto) {

        if (userRepository.existsByEmail(userRequestDto.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email already exists: " + userRequestDto.email());
        }
        if (userRepository.existsByGithubName(userRequestDto.githubName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "GithubName already exists: " +
                            userRequestDto.githubName());
        }
        User newUser = userRequestDto.toEntity();
        User savedUser = userRepository.save(newUser);
        return UserResponseDto.from(savedUser); // Return the savedUser, not the newUser!
    }

    @Transactional
    public UserResponseDto updateUser(UUID id, UserRequestDto userRequestDto) {
        // first check existence!
        User existingUser = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "No user found with id: " + id));
        // then check duplicates:
        if (userRepository.existsByEmailAndIdNot(userRequestDto.email(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email already exists: " + userRequestDto.email());
        }
        if (userRepository.existsByGithubNameAndIdNot(userRequestDto.githubName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "GithubName already exists: " +
                            userRequestDto.githubName());
        }

        existingUser.setName(userRequestDto.name());
        existingUser.setNickname(userRequestDto.nickname());
        existingUser.setRole(userRequestDto.role());
        existingUser.setGithubName(userRequestDto.githubName());
        existingUser.setEmail(userRequestDto.email());
        existingUser.setAvatarUrl(userRequestDto.avatarUrl());
        User savedUser = userRepository.save(existingUser);
        return UserResponseDto.from(savedUser);
    }
}
