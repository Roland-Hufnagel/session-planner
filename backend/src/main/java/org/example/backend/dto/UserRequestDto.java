package org.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.backend.model.Role;
import org.example.backend.model.User;

public record UserRequestDto(
        @NotBlank
        String name,
        @NotBlank
        String nickname,
        @NotNull
        Role role,
        @NotBlank
        String githubName,
        @NotBlank
        @Email
        String email,
        // nullable -> no validation
        String avatarUrl
) {
    public User toEntity() {
        return User.builder()
                .name(this.name())
                .nickname(this.nickname())
                .role(this.role())
                .githubName(this.githubName())
                .email(this.email())
                .avatarUrl(this.avatarUrl())
                .build();
    }
}