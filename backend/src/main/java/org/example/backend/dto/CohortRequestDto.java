package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.backend.model.Cohort;
import org.example.backend.model.Department;
import org.example.backend.model.FederalState;

import java.time.LocalDate;

public record CohortRequestDto(
        @NotBlank
        String name,
        String nickname,
        @NotBlank
        LocalDate startDate,
        @NotBlank
        LocalDate endDate,
        @NotNull
        FederalState federalState,
        @NotNull
        Department department,
        @NotBlank
        String colorCode
) {
    public Cohort toEntity() {
        return Cohort.builder()
                .name(this.name())
                .nickname(this.nickname())
                .startDate(this.startDate())
                .endDate(this.endDate())
                .federalState(this.federalState())
                .department(this.department())
                .colorCode(this.colorCode())
                .build();
    }


}
