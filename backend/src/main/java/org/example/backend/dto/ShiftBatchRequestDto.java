package org.example.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ShiftBatchRequestDto(
        @NotNull
        UUID cohortId,
        // @NotEmpty und @Size gelten der Liste selbst, @Valid ihren Elementen:
        // es kaskadiert in jedes ShiftImportRowDto und fuehrt den Index im
        // Property-Pfad mit ("shifts[3].title").
        @NotEmpty
        @Size(max = 500)
        List<@Valid ShiftImportRowDto> shifts
) {
}
