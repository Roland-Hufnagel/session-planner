package org.example.backend.repository;

import org.example.backend.model.Shift;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    @EntityGraph(attributePaths = {"coach", "cohort"})
    List<Shift> findByDateBetweenOrderByDateAscStartTimeAsc(LocalDate from, LocalDate to);

    long countByCohortId(UUID cohortId);

    void deleteByCohortId(UUID cohortId);

    List<Shift> findByCoachId(UUID coachId);
}
