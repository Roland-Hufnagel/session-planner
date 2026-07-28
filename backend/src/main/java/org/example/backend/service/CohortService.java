package org.example.backend.service;

import org.example.backend.dto.CohortRequestDto;
import org.example.backend.dto.CohortResponseDto;
import org.example.backend.exception.DuplicateResourceException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Cohort;
import org.example.backend.repository.CohortRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CohortService {
    private final CohortRepository cohortRepository;

    public CohortService(CohortRepository cohortRepository) {
        this.cohortRepository = cohortRepository;
    }

    public List<CohortResponseDto> findAllCohorts() {
        List<Cohort> cohorts = cohortRepository.findAll();
        return cohorts.stream()
                .map(CohortResponseDto::from)
                .toList();
    }

    public CohortResponseDto findCohortById(UUID id) {
        Cohort cohort = cohortRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "No cohort found with id: " + id));
        return CohortResponseDto.from(cohort);
    }

    @Transactional
    public CohortResponseDto createCohort(CohortRequestDto cohortRequestDto) {

        if (cohortRepository.existsByName(cohortRequestDto.name())) {
            throw new DuplicateResourceException(
                    "Cohort already exists: " + cohortRequestDto.name());
        }

        Cohort newCohort = cohortRequestDto.toEntity();
        Cohort savedCohort = cohortRepository.save(newCohort);
        return CohortResponseDto.from(savedCohort);
    }

    @Transactional
    public CohortResponseDto updateCohort(UUID id, CohortRequestDto cohortRequestDto) {
        // first check existence!
        Cohort existingCohort = cohortRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "No cohort found with id: " + id));
        // then check duplicates:
        if (cohortRepository.existsByNameAndIdNot(cohortRequestDto.name(), id)) {
            throw new DuplicateResourceException(
                    "Cohort Name already exists: " +
                            cohortRequestDto.name());
        }

        existingCohort.setName(cohortRequestDto.name());
        existingCohort.setNickname(cohortRequestDto.nickname());
        existingCohort.setStartDate(cohortRequestDto.startDate());
        existingCohort.setEndDate(cohortRequestDto.endDate());
        existingCohort.setFederalState(cohortRequestDto.federalState());
        existingCohort.setDepartment(cohortRequestDto.department());
        existingCohort.setColorCode(cohortRequestDto.colorCode());
        Cohort savedCohort = cohortRepository.save(existingCohort);
        return CohortResponseDto.from(savedCohort);
    }

    @Transactional
    public void deleteCohortById(UUID id) {
        if (!cohortRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "No cohort found with id: " + id);
        }
        cohortRepository.deleteById(id);
    }
}
