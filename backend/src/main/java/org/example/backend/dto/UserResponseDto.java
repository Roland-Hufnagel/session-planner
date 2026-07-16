package org.example.backend.dto;

import org.example.backend.model.Role;
import org.example.backend.model.User;

import java.util.UUID;


public record UserResponseDto(
        UUID id,
        String name,
        String nickname,
        Role role,
        String githubName,
        String email,
        String avatarUrl
) {
    public static UserResponseDto from(User u) {
        return new UserResponseDto(u.getId(),
                u.getName(),
                u.getNickname(),
                u.getRole(),
                u.getGithubName(),
                u.getEmail(),
                u.getAvatarUrl());
    }
}
