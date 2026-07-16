package org.example.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    // Hibernate automatically creates table name 'github_name' from field 'githubName'
    @Column(nullable = false, unique = true)
    private String githubName;

    @Column(nullable = false, unique = true)
    private String email;

    // Can be null -> no @Column constraints
    private String avatarUrl;
}


