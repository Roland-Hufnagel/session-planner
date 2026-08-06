package org.example.backend.service;

import org.example.backend.dto.ShiftRequestDto;
import org.example.backend.dto.ShiftResponseDto;
import org.example.backend.exception.InvalidDateRangeException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Cohort;
import org.example.backend.model.Shift;
import org.example.backend.model.User;
import org.example.backend.repository.CohortRepository;
import org.example.backend.repository.ShiftRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ShiftService {
    private static final int MAX_RANGE_DAYS = 30;

    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final CohortRepository cohortRepository;

    public ShiftService(ShiftRepository shiftRepository, UserRepository userRepository, CohortRepository cohortRepository) {
        this.shiftRepository = shiftRepository;
        this.userRepository = userRepository;
        this.cohortRepository = cohortRepository;
    }

    public List<ShiftResponseDto> findShiftsBetween(LocalDate from, LocalDate to) {
        validateDateRange(from, to);
        List<Shift> shifts = shiftRepository.findByDateBetweenOrderByDateAscStartTimeAsc(from, to);
        return shifts.stream()
                .map(ShiftResponseDto::from)
                .toList();
    }

    public List<ShiftResponseDto> findShiftsOfCohort(UUID cohortId) {
        // 404 statt leerer Liste: Eine unbekannte cohortId ist ein Fehler des
        // Aufrufers, keine Cohorte ohne Shifts.
        if (!cohortRepository.existsById(cohortId)) {
            throw new ResourceNotFoundException(
                    "No cohort found with id: " + cohortId);
        }
        List<Shift> shifts = shiftRepository.findByCohortIdOrderByDateAscStartTimeAsc(cohortId);
        return shifts.stream()
                .map(ShiftResponseDto::from)
                .toList();
    }

    @Transactional
    public ShiftResponseDto createShift(ShiftRequestDto shiftRequestDto) {
        validateTimeRange(shiftRequestDto.startTime(), shiftRequestDto.endTime());
        Cohort cohort = getCohort(shiftRequestDto.cohortId());
        User coach = getCoach(shiftRequestDto.coachId());

        Shift newShift = shiftRequestDto.toEntity(coach, cohort);
        Shift savedShift = shiftRepository.save(newShift);
        return ShiftResponseDto.from(savedShift);
    }

    @Transactional
    public ShiftResponseDto updateShift(UUID id, ShiftRequestDto shiftRequestDto) {
        // first check the existence!
        Shift existingShift = shiftRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "No shift found with id: " + id));
        validateTimeRange(shiftRequestDto.startTime(), shiftRequestDto.endTime());
        Cohort cohort = getCohort(shiftRequestDto.cohortId());
        User coach = getCoach(shiftRequestDto.coachId());

        existingShift.setTitle(shiftRequestDto.title());
        existingShift.setDate(shiftRequestDto.date());
        existingShift.setStartTime(shiftRequestDto.startTime());
        existingShift.setEndTime(shiftRequestDto.endTime());
        existingShift.setCoach(coach);
        existingShift.setCohort(cohort);
        Shift savedShift = shiftRepository.save(existingShift);
        return ShiftResponseDto.from(savedShift);
    }

    @Transactional
    public ShiftResponseDto assignCoach(UUID shiftId, UUID coachId) {
        Shift existingShift = shiftRepository.findById(shiftId).orElseThrow(() -> new ResourceNotFoundException(
                "No shift found with id: " + shiftId));
        User assignedCoach = getCoach(coachId);
        existingShift.setCoach(assignedCoach);
        Shift savedShift = shiftRepository.save(existingShift);
        return ShiftResponseDto.from(savedShift);
    }


    // Helper:
    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new InvalidDateRangeException(
                    "'from' must not be after 'to' " + from + " > " + to);
        }
        long days = ChronoUnit.DAYS.between(from, to) + 1;
        if (days > MAX_RANGE_DAYS) {
            throw new InvalidDateRangeException(
                    "Date range must not exceed " + MAX_RANGE_DAYS +
                            " days, but was " + days + " days");
        }
    }

    private void validateTimeRange(LocalTime start, LocalTime end) {
        if (!end.isAfter(start)) {
            throw new InvalidDateRangeException(
                    "'endTime' must be after 'startTime': "
                            + start + " >= " +
                            end);
        }
    }

    private User getCoach(UUID coachId) {
        return coachId == null ? null :
                userRepository.findById(coachId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No coach found with id: " + coachId));
    }

    private Cohort getCohort(UUID cohortId) {
        return cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No cohort found with id: " + cohortId));
    }

    @Transactional
    public void deleteShiftById(UUID id) {
        if (!shiftRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "No shift found with id: " + id);
        }
        shiftRepository.deleteById(id);
    }
}
