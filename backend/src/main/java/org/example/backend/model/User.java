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

    @Column(nullable = false, unique = true)
    private String githubName;

    @Column(nullable = false, unique = true)
    private String email;

    // Can be null -> no @Column constraints
    private String avatarUrl;

    // @Builder.Default ermöglicht ein Objekt zu bauen ohne '.active' anzugeben
    // columnDefinition setzt alte Tabelleneinträge, die noch kein 'active' besaßen auf true (wegen notNull Constraint)
    @Builder.Default
    @Column(columnDefinition = "boolean not null default true")
    private boolean active = true;
}


