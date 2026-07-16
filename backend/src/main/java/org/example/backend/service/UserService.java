package org.example.backend.service;

import org.example.backend.dto.UserRequestDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;


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
                "No user with id: " + id));
        return UserResponseDto.from(user);
    }

    public void deleteUserById(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No user found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserResponseDto create(UserRequestDto userRequestDto) {
        User newUser = userRequestDto.toEntity();
        User savedUser = userRepository.save(newUser);
        return UserResponseDto.from(savedUser); // Return the savedUser, not the newUser!
    }
}
