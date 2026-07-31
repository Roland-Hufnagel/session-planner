package org.example.backend.repository;

import org.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByGithubName(String githubName);

    boolean existsByGithubNameAndActiveTrue(String githubName);

    Optional<User> findByEmail(String email);

}
