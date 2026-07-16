package org.example.backend.dto;

import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.springframework.validation.annotation.Validated;

@Validated
public record UserRequestDto(

        String name,
        String nickname,
        Role role,
        String githubName,
        String email,
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