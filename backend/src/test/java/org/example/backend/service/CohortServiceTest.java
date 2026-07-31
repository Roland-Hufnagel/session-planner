package org.example.backend.service;

import org.example.backend.dto.CohortRequestDto;
import org.example.backend.dto.CohortResponseDto;
import org.example.backend.exception.DuplicateResourceException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Cohort;
import org.example.backend.model.Department;
import org.example.backend.model.FederalState;
import org.example.backend.repository.CohortRepository;
import org.example.backend.repository.ShiftRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CohortServiceTest {

    private final CohortRepository mockRepo = mock(CohortRepository.class);
    // Cohorten loeschen nimmt die zugehoerigen Shifts mit -> ShiftRepository noetig
    private final ShiftRepository mockShiftRepo = mock(ShiftRepository.class);
    private final CohortService cohortService = new CohortService(mockRepo, mockShiftRepo);

    private static final LocalDate START = LocalDate.of(2025, Month.SEPTEMBER, 1);
    private static final LocalDate END = LocalDate.of(2026, Month.FEBRUARY, 27);

    // ----- findAllCohorts -----
    @Test
    void findAllCohorts_returnsListOfDTOs() {
        // given:
        UUID id = UUID.randomUUID();
        Cohort cohort = Cohort.builder()
                .id(id)
                .name("java-25-3")
                .nickname("Die Coffeebeans")
                .startDate(START)
                .endDate(END)
                .federalState(FederalState.HH)
                .department(Department.JAVA)
                .colorCode("#D93500")
                .build();
        List<Cohort> cohortList = List.of(cohort);
        CohortResponseDto cohortResponseDto = CohortResponseDto.from(cohort);
        List<CohortResponseDto> cohortResponseDtoList = List.of(cohortResponseDto);
        // when then
        when(mockRepo.findAll()).thenReturn(cohortList);
        assertThat(cohortService.findAllCohorts()).isEqualTo(cohortResponseDtoList);
    }

    // ----- findCohortById -----
    @Test
    void findCohortById_returnsDTO_whenCohortExists() {
        // given:
        UUID id = UUID.randomUUID();
        Cohort cohort = Cohort.builder()
                .id(id)
                .name("java-25-3")
                .nickname("Die Coffeebeans")
                .startDate(START)
                .endDate(END)
                .federalState(FederalState.HH)
                .department(Department.JAVA)
                .colorCode("#D93500")
                .build();
        // when then
        when(mockRepo.findById(id)).thenReturn(Optional.of(cohort));
        CohortResponseDto result = cohortService.findCohortById(id);
        assertThat(result.id()).isEqualTo(id);
        assertThat(result.name()).isEqualTo("java-25-3");
        assertThat(result.department()).isEqualTo(Department.JAVA);
    }

    @Test
    void findCohortById_throwsNotFound_whenCohortNotExists() {
        // given:
        UUID id = UUID.randomUUID();
        // when then
        // the repo does not throw an exception. It only returns an empty Optional
        when(mockRepo.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> cohortService.findCohortById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(id.toString());
    }

    // ----- createCohort -----
    @Test
    void createCohort_savesAndReturnsDto() {
        CohortRequestDto requestDTO = new CohortRequestDto(
                "java-25-3", "Die Coffeebeans", START, END,
                FederalState.HH, Department.JAVA, "#D93500");
        Cohort savedCohort = Cohort.builder()
                .id(UUID.randomUUID())
                .name(requestDTO.name()).nickname(requestDTO.nickname())
                .startDate(requestDTO.startDate()).endDate(requestDTO.endDate())
                .federalState(requestDTO.federalState()).department(requestDTO.department())
                .colorCode(requestDTO.colorCode())
                .build();
        // any(Cohort.class) simulates Hibernate: 'Create a Cohort with id'
        when(mockRepo.save(any(Cohort.class))).thenReturn(savedCohort);

        CohortResponseDto result = cohortService.createCohort(requestDTO);

        assertThat(result.id()).isEqualTo(savedCohort.getId());
        assertThat(result.name()).isEqualTo("java-25-3");
        assertThat(result.startDate()).isEqualTo(START);
        verify(mockRepo).save(any(Cohort.class)); // verify 'save' was called
    }

    @Test
    void createCohort_throwsConflict_whenNameExists() {
        CohortRequestDto requestDTO = new CohortRequestDto(
                "java-25-3", "Die Coffeebeans", START, END,
                FederalState.HH, Department.JAVA, "#D93500");
        when(mockRepo.existsByName(requestDTO.name())).thenReturn(true); // mocks that the name is already used

        assertThatThrownBy(() -> cohortService.createCohort(requestDTO))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(requestDTO.name());
        verify(mockRepo, never()).save(any()); // verify 'save' was never called (@Transactional)
    }

    // ----- updateCohort -----
    @Test
    void updateCohort_updatesAndReturnsDto() {
        UUID id = UUID.randomUUID();
        Cohort existingCohort = Cohort.builder()
                .id(id)
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(START).endDate(END)
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build();
        CohortRequestDto requestDTO = new CohortRequestDto(
                "java-25-3", "Die Bohnen", START, LocalDate.of(2026, Month.MARCH, 31), // nickname, endDate and federalState changed
                FederalState.BE, Department.JAVA, "#D93500");
        when(mockRepo.findById(id)).thenReturn(Optional.of(existingCohort));
        when(mockRepo.save(any(Cohort.class))).thenReturn(existingCohort);

        CohortResponseDto result = cohortService.updateCohort(id, requestDTO);

        assertThat(result.nickname()).isEqualTo("Die Bohnen");
        assertThat(result.endDate()).isEqualTo(LocalDate.of(2026, Month.MARCH, 31));
        assertThat(result.federalState()).isEqualTo(FederalState.BE);
        verify(mockRepo).save(any(Cohort.class));
    }

    @Test
    void updateCohort_throwsNotFound_whenCohortDoesNotExist() {
        UUID id = UUID.randomUUID();
        CohortRequestDto requestDTO = new CohortRequestDto(
                "java-25-3", "Die Coffeebeans", START, END,
                FederalState.HH, Department.JAVA, "#D93500");
        when(mockRepo.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cohortService.updateCohort(id, requestDTO))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(id.toString());

        verify(mockRepo, never()).save(any());
    }

    @Test
    void updateCohort_throwsConflict_whenNameBelongsToAnotherCohort() {
        UUID id = UUID.randomUUID();
        Cohort existing = Cohort.builder()
                .id(id)
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(START).endDate(END)
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build();
        CohortRequestDto request = new CohortRequestDto(
                "java-25-3", "Die Coffeebeans", START, END,
                FederalState.HH, Department.JAVA, "#D93500");
        when(mockRepo.findById(id)).thenReturn(Optional.of(existing));
        when(mockRepo.existsByNameAndIdNot(request.name(), id)).thenReturn(true); // mocks that the name already exists

        assertThatThrownBy(() -> cohortService.updateCohort(id, request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining(request.name());

        verify(mockRepo, never()).save(any());
    }

    // ----- deleteCohort -----
    @Test
    void deleteCohortById_deletes_whenCohortExists() {
        UUID id = UUID.randomUUID();
        when(mockRepo.existsById(id)).thenReturn(true); // mocks that the cohort exists

        cohortService.deleteCohortById(id);

        verify(mockRepo).deleteById(id); // verify deleteById(id) was called
    }

    @Test
    void deleteCohortById_throwsNotFound_whenCohortDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(mockRepo.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> cohortService.deleteCohortById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(id.toString());

        verify(mockRepo, never()).deleteById(any(UUID.class)); // verify deleteById was never called
    }

}
