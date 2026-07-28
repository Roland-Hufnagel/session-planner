package org.example.backend.dto;

import org.example.backend.model.*;

import java.time.LocalDate;
import java.util.UUID;


public record CohortResponseDto(
        UUID id,
        String name,
        String nickname,
        LocalDate startDate,
        LocalDate endDate,
        FederalState federalState,
        Department department,
        String colorCode

) {
    public static CohortResponseDto from(Cohort c) {
        return new CohortResponseDto(
                c.getId(),
                c.getName(),
                c.getNickname(),
                c.getStartDate(),
                c.getEndDate(),
                c.getFederalState(),
                c.getDepartment(),
                c.getColorCode());
    }
}