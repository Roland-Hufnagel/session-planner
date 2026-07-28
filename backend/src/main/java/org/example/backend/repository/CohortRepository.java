package org.example.backend.repository;

import org.example.backend.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CohortRepository extends JpaRepository<Cohort, UUID> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, UUID id);
}
