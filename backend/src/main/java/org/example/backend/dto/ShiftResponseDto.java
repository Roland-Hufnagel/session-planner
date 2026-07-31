package org.example.backend.dto;

import org.example.backend.model.Shift;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ShiftResponseDto(
        UUID id,
        String title,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        UserResponseDto coach,
        CohortResponseDto cohort
) {
    public static ShiftResponseDto from(Shift s) {
        return new ShiftResponseDto(
                s.getId(),
                s.getTitle(),
                s.getDate(),
                s.getStartTime(),
                s.getEndTime(),
                s.getCoach() == null ? null :
                        UserResponseDto.from(s.getCoach()),
                CohortResponseDto.from(s.getCohort())
        );
    }
}
