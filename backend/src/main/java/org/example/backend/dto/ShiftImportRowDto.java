package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.backend.model.Cohort;
import org.example.backend.model.Shift;

import java.time.LocalDate;
import java.time.LocalTime;

public record ShiftImportRowDto(
        @NotBlank
        String title,
        @NotNull
        LocalDate date,
        @NotNull
        LocalTime startTime,
        @NotNull
        LocalTime endTime
) {
    public Shift toEntity(Cohort cohort) {
        return Shift.builder()
                .title(title())
                .date(date())
                .startTime(startTime())
                .endTime(endTime())
                .cohort(cohort)
                .build();
    }
}
