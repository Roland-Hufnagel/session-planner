package org.example.backend.dto;

import java.util.UUID;

public record AssignCoachRequestDto(
        // Bewusst nullable und ohne @NotNull: null bedeutet "Coach entfernen"
        // (Unassign) und ist auf der Schedule ein normaler Vorgang.
        UUID coachId
) {
}
