package org.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
// Don't include Fields to the Response that are null (validationErrors)!
public record ApiError(
        int status,
        String message,
        Instant timestamp,
        Map<String, String> validationErrors // filled when 400 else null
) {
}
