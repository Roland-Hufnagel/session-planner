package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.backend.model.Cohort;
import org.example.backend.model.Shift;
import org.example.backend.model.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ShiftRequestDto(
        @NotBlank
        String title,
        @NotNull
        LocalDate date,
        @NotNull
        LocalTime startTime,
        @NotNull
        LocalTime endTime,
        // may be null:
        UUID coachId,
        @NotNull
        UUID cohortId
) {
    public Shift toEntity(User coach, Cohort cohort) {
        return Shift.builder()
                .title(this.title())
                .date(this.date())
                .startTime(this.startTime())
                .endTime(this.endTime())
                .coach(coach)
                .cohort(cohort)
                .build();
    }
}
