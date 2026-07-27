package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.CohortRequestDto;
import org.example.backend.dto.CohortResponseDto;
import org.example.backend.service.CohortService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cohorts")
public class CohortController {
    private final CohortService cohortService;

    public CohortController(CohortService cohortService) {
        this.cohortService = cohortService;
    }

    @GetMapping
    public List<CohortResponseDto> findAllCohorts() {
        return cohortService.findAllCohorts();
    }

    @GetMapping("/{id}")
    public CohortResponseDto findCohortById(@PathVariable UUID id) { // maps the String to an UUID
        return cohortService.findCohortById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CohortResponseDto createCohort(@Valid @RequestBody CohortRequestDto cohortRequestDto) {
        return cohortService.createCohort(cohortRequestDto);
    }

    @PutMapping("/{id}")
    public CohortResponseDto updateCohort(@PathVariable UUID id, @Valid @RequestBody CohortRequestDto cohortRequestDto) {
        return cohortService.updateCohort(id, cohortRequestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCohortById(@PathVariable UUID id) {
        cohortService.deleteCohortById(id);
    }
}
