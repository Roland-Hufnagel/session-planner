package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.UserRequestDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponseDto> findAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponseDto findUserById(@PathVariable UUID id) { // maps the String to an UUID
        return userService.findUserById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDto createUser(@Valid @RequestBody UserRequestDto userRequestDto) {
        return userService.create(userRequestDto);
    }

    @PutMapping("/{id}")
    public UserResponseDto updateUser(@PathVariable UUID id, @Valid @RequestBody UserRequestDto userRequestDto) {
        return userService.updateUser(id, userRequestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUserById(@PathVariable UUID id) {
        userService.deleteUserById(id);
    }


}
