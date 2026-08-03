package org.example.backend.service;

import org.example.backend.dto.ShiftRequestDto;
import org.example.backend.dto.ShiftResponseDto;
import org.example.backend.exception.InvalidDateRangeException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.*;
import org.example.backend.repository.CohortRepository;
import org.example.backend.repository.ShiftRepository;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ShiftServiceTest {

    private final ShiftRepository mockShiftRepo = mock(ShiftRepository.class);
    private final UserRepository mockUserRepo = mock(UserRepository.class);
    private final CohortRepository mockCohortRepo = mock(CohortRepository.class);
    private final ShiftService shiftService =
            new ShiftService(mockShiftRepo, mockUserRepo, mockCohortRepo);

    private static final LocalDate DATE = LocalDate.of(2026, Month.AUGUST, 5);
    private static final LocalTime START = LocalTime.of(9, 0);
    private static final LocalTime END = LocalTime.of(12, 30);

    private static Cohort cohort(UUID id) {
        return Cohort.builder()
                .id(id)
                .name("java-25-3").nickname("Die Coffeebeans")
                .startDate(LocalDate.of(2026, Month.AUGUST, 3))
                .endDate(LocalDate.of(2027, Month.FEBRUARY, 26))
                .federalState(FederalState.HH).department(Department.JAVA)
                .colorCode("#D93500")
                .build();
    }

    private static User coach(UUID id) {
        return User.builder()
                .id(id)
                .name("Peter Klein").nickname("Pete").role(Role.COACH)
                .githubName("peterk").email("peterk@neuefische.de")
                .build();
    }

    private static Shift shift(UUID id, User coach, Cohort cohort) {
        return Shift.builder()
                .id(id)
                .title("Morning session").date(DATE)
                .startTime(START).endTime(END)
                .coach(coach).cohort(cohort)
                .build();
    }

    private static ShiftRequestDto request(UUID coachId, UUID cohortId) {
        return new ShiftRequestDto("Morning session", DATE, START, END, coachId, cohortId);
    }

    // ----- findShiftsBetween -----
    @Test
    void findShiftsBetween_returnsListOfDTOs() {
        Shift shift = shift(UUID.randomUUID(), coach(UUID.randomUUID()), cohort(UUID.randomUUID()));
        when(mockShiftRepo.findByDateBetweenOrderByDateAscStartTimeAsc(any(), any()))
                .thenReturn(List.of(shift));

        List<ShiftResponseDto> result = shiftService.findShiftsBetween(
                LocalDate.of(2026, Month.AUGUST, 3), LocalDate.of(2026, Month.AUGUST, 9));

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().title()).isEqualTo("Morning session");
        assertThat(result.getFirst().coach().nickname()).isEqualTo("Pete");
        assertThat(result.getFirst().cohort().name()).isEqualTo("java-25-3");
    }

    @Test
    void findShiftsBetween_acceptsSingleDay() {
        LocalDate day = LocalDate.of(2026, Month.AUGUST, 5);
        when(mockShiftRepo.findByDateBetweenOrderByDateAscStartTimeAsc(day, day))
                .thenReturn(List.of());

        // from == to ist ein Tag, nicht null Tage
        assertThat(shiftService.findShiftsBetween(day, day)).isEmpty();
    }

    @Test
    void findShiftsBetween_acceptsExactly30Days() {
        LocalDate from = LocalDate.of(2026, Month.AUGUST, 3);
        LocalDate to = LocalDate.of(2026, Month.SEPTEMBER, 1); // inklusiv = 30 Tage
        when(mockShiftRepo.findByDateBetweenOrderByDateAscStartTimeAsc(from, to))
                .thenReturn(List.of());

        assertThat(shiftService.findShiftsBetween(from, to)).isEmpty();
    }

    @Test
    void findShiftsBetween_throwsBadRequest_when31Days() {
        LocalDate from = LocalDate.of(2026, Month.AUGUST, 3);
        LocalDate to = LocalDate.of(2026, Month.SEPTEMBER, 2); // inklusiv = 31 Tage

        assertThatThrownBy(() -> shiftService.findShiftsBetween(from, to))
                .isInstanceOf(InvalidDateRangeException.class)
                .hasMessageContaining("31");

        verify(mockShiftRepo, never()).findByDateBetweenOrderByDateAscStartTimeAsc(any(), any());
    }

    @Test
    void findShiftsBetween_throwsBadRequest_whenFromIsAfterTo() {
        LocalDate from = LocalDate.of(2026, Month.AUGUST, 10);
        LocalDate to = LocalDate.of(2026, Month.AUGUST, 3);

        assertThatThrownBy(() -> shiftService.findShiftsBetween(from, to))
                .isInstanceOf(InvalidDateRangeException.class)
                .hasMessageContaining("'from' must not be after 'to'");

        verify(mockShiftRepo, never()).findByDateBetweenOrderByDateAscStartTimeAsc(any(), any());
    }

    // ----- findShiftsOfCohort -----
    @Test
    void findShiftsOfCohort_returnsListOfDTOs() {
        UUID cohortId = UUID.randomUUID();
        Shift shift = shift(UUID.randomUUID(), coach(UUID.randomUUID()), cohort(cohortId));
        when(mockCohortRepo.existsById(cohortId)).thenReturn(true);
        when(mockShiftRepo.findByCohortIdOrderByDateAscStartTimeAsc(cohortId))
                .thenReturn(List.of(shift));

        List<ShiftResponseDto> result = shiftService.findShiftsOfCohort(cohortId);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().cohort().id()).isEqualTo(cohortId);
    }

    @Test
    void findShiftsOfCohort_returnsEmptyList_whenCohortHasNoShifts() {
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.existsById(cohortId)).thenReturn(true);
        when(mockShiftRepo.findByCohortIdOrderByDateAscStartTimeAsc(cohortId))
                .thenReturn(List.of());

        // Eine Cohorte ohne Shifts ist kein Fehler
        assertThat(shiftService.findShiftsOfCohort(cohortId)).isEmpty();
    }

    @Test
    void findShiftsOfCohort_throwsNotFound_whenCohortDoesNotExist() {
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.existsById(cohortId)).thenReturn(false);

        // Unbekannte cohortId ist ein Aufrufer-Fehler, keine leere Liste
        assertThatThrownBy(() -> shiftService.findShiftsOfCohort(cohortId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No cohort found with id: " + cohortId);

        verify(mockShiftRepo, never()).findByCohortIdOrderByDateAscStartTimeAsc(any());
    }

    @Test
    void findShiftsOfCohort_ignoresTheThirtyDayLimit() {
        // Eine Cohorte laeuft ~6 Monate. Genau deshalb gibt es diesen Weg:
        // ueber from/to waere die Abfrage an MAX_RANGE_DAYS gescheitert.
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.existsById(cohortId)).thenReturn(true);
        when(mockShiftRepo.findByCohortIdOrderByDateAscStartTimeAsc(cohortId))
                .thenReturn(List.of(
                        shift(UUID.randomUUID(), null, cohort(cohortId)),
                        shift(UUID.randomUUID(), null, cohort(cohortId))));

        assertThat(shiftService.findShiftsOfCohort(cohortId)).hasSize(2);
    }

    // ----- createShift -----
    @Test
    void createShift_savesAndReturnsDto() {
        UUID coachId = UUID.randomUUID();
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.findById(cohortId)).thenReturn(Optional.of(cohort(cohortId)));
        when(mockUserRepo.findById(coachId)).thenReturn(Optional.of(coach(coachId)));
        when(mockShiftRepo.save(any(Shift.class)))
                .thenReturn(shift(UUID.randomUUID(), coach(coachId), cohort(cohortId)));

        ShiftResponseDto result = shiftService.createShift(request(coachId, cohortId));

        assertThat(result.title()).isEqualTo("Morning session");
        assertThat(result.coach().nickname()).isEqualTo("Pete");
        verify(mockShiftRepo).save(any(Shift.class));
    }

    @Test
    void createShift_savesWithoutCoach_whenCoachIdIsNull() {
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.findById(cohortId)).thenReturn(Optional.of(cohort(cohortId)));
        when(mockShiftRepo.save(any(Shift.class)))
                .thenReturn(shift(UUID.randomUUID(), null, cohort(cohortId)));

        ShiftResponseDto result = shiftService.createShift(request(null, cohortId));

        // Unbesetzte Shift ist erlaubt: coach bleibt null, und das Repository
        // darf mit null gar nicht erst befragt werden (findById(null) wirft).
        assertThat(result.coach()).isNull();
        verify(mockUserRepo, never()).findById(any());
        verify(mockShiftRepo).save(any(Shift.class));
    }

    @Test
    void createShift_throwsNotFound_whenCohortDoesNotExist() {
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.findById(cohortId)).thenReturn(Optional.empty());
        ShiftRequestDto requestDto = request(null, cohortId);

        assertThatThrownBy(() -> shiftService.createShift(requestDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No cohort found with id: " + cohortId);

        verify(mockShiftRepo, never()).save(any());
    }

    @Test
    void createShift_throwsNotFound_whenCoachDoesNotExist() {
        UUID coachId = UUID.randomUUID();
        UUID cohortId = UUID.randomUUID();
        when(mockCohortRepo.findById(cohortId)).thenReturn(Optional.of(cohort(cohortId)));
        when(mockUserRepo.findById(coachId)).thenReturn(Optional.empty());
        ShiftRequestDto requestDto = request(coachId, cohortId);

        // Eine unbekannte coachId darf nicht still zu einer unbesetzten Shift werden.
        assertThatThrownBy(() -> shiftService.createShift(requestDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No coach found with id: " + coachId);

        verify(mockShiftRepo, never()).save(any());
    }

    @Test
    void createShift_throwsBadRequest_whenEndTimeIsNotAfterStartTime() {
        ShiftRequestDto backwards = new ShiftRequestDto(
                "Backwards", DATE, LocalTime.of(18, 0), LocalTime.of(9, 0),
                null, UUID.randomUUID());

        assertThatThrownBy(() -> shiftService.createShift(backwards))
                .isInstanceOf(InvalidDateRangeException.class)
                .hasMessageContaining("'endTime' must be after 'startTime'");

        verify(mockShiftRepo, never()).save(any());
    }

    @Test
    void createShift_throwsBadRequest_whenStartAndEndAreEqual() {
        LocalTime sameTime = LocalTime.of(9, 0);
        ShiftRequestDto zeroLength = new ShiftRequestDto(
                "Zero length", DATE, sameTime, sameTime, null, UUID.randomUUID());

        // Eine Shift ohne Dauer ist genauso unsinnig wie eine rueckwaerts laufende.
        assertThatThrownBy(() -> shiftService.createShift(zeroLength))
                .isInstanceOf(InvalidDateRangeException.class);

        verify(mockShiftRepo, never()).save(any());
    }

    // ----- updateShift -----
    @Test
    void updateShift_updatesAndReturnsDto() {
        UUID id = UUID.randomUUID();
        UUID cohortId = UUID.randomUUID();
        Shift existingShift = shift(id, coach(UUID.randomUUID()), cohort(cohortId));
        when(mockShiftRepo.findById(id)).thenReturn(Optional.of(existingShift));
        when(mockCohortRepo.findById(cohortId)).thenReturn(Optional.of(cohort(cohortId)));
        when(mockShiftRepo.save(any(Shift.class))).thenReturn(existingShift);

        ShiftRequestDto changed = new ShiftRequestDto(
                "Afternoon session", DATE, LocalTime.of(13, 0), LocalTime.of(17, 0),
                null, cohortId); // Titel, Zeiten geaendert, Coach entfernt

        ShiftResponseDto result = shiftService.updateShift(id, changed);

        assertThat(result.title()).isEqualTo("Afternoon session");
        assertThat(result.startTime()).isEqualTo(LocalTime.of(13, 0));
        // PUT ersetzt vollstaendig: coachId null entfernt den Coach
        assertThat(result.coach()).isNull();
        verify(mockShiftRepo).save(any(Shift.class));
    }

    @Test
    void updateShift_throwsNotFound_whenShiftDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(mockShiftRepo.findById(id)).thenReturn(Optional.empty());
        ShiftRequestDto requestDto = request(null, UUID.randomUUID());

        assertThatThrownBy(() -> shiftService.updateShift(id, requestDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No shift found with id: " + id);

        verify(mockShiftRepo, never()).save(any());
    }

    @Test
    void updateShift_checksShiftExistenceBeforeReferences() {
        UUID id = UUID.randomUUID();
        UUID unknownCohortId = UUID.randomUUID();
        when(mockShiftRepo.findById(id)).thenReturn(Optional.empty());
        ShiftRequestDto requestDto = request(null, unknownCohortId);

        // Beides unbekannt -> die Meldung muss auf die Shift zeigen, nicht auf
        // die Cohort. Sonst sucht man beim Debuggen an der falschen Stelle.
        assertThatThrownBy(() -> shiftService.updateShift(id, requestDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No shift found with id");

        verify(mockCohortRepo, never()).findById(any());
    }

    // ----- deleteShiftById -----
    @Test
    void deleteShiftById_deletes_whenShiftExists() {
        UUID id = UUID.randomUUID();
        when(mockShiftRepo.existsById(id)).thenReturn(true);

        shiftService.deleteShiftById(id);

        // Anders als beim User ist das hier ein echtes Loeschen: Eine Shift ist
        // ein Kalendereintrag, keine Person mit Historie.
        verify(mockShiftRepo).deleteById(id);
    }

    @Test
    void deleteShiftById_throwsNotFound_whenShiftDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(mockShiftRepo.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> shiftService.deleteShiftById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(id.toString());

        verify(mockShiftRepo, never()).deleteById(any(UUID.class));
    }

    // ----- assignCoach -----
    @Test
    void assignCoach_setsCoachAndReturnsDto() {
        UUID id = UUID.randomUUID();
        UUID coachId = UUID.randomUUID();
        Shift existingShift = shift(id, null, cohort(UUID.randomUUID())); // unbesetzt
        when(mockShiftRepo.findById(id)).thenReturn(Optional.of(existingShift));
        when(mockUserRepo.findById(coachId)).thenReturn(Optional.of(coach(coachId)));
        when(mockShiftRepo.save(any(Shift.class))).thenReturn(existingShift);

        ShiftResponseDto result = shiftService.assignCoach(id, coachId);

        assertThat(result.coach()).isNotNull();
        assertThat(result.coach().id()).isEqualTo(coachId);
        verify(mockShiftRepo).save(any(Shift.class));
    }

    @Test
    void assignCoach_removesCoach_whenCoachIdIsNull() {
        UUID id = UUID.randomUUID();
        Shift existingShift = shift(id, coach(UUID.randomUUID()), cohort(UUID.randomUUID()));
        when(mockShiftRepo.findById(id)).thenReturn(Optional.of(existingShift));
        when(mockShiftRepo.save(any(Shift.class))).thenReturn(existingShift);

        ShiftResponseDto result = shiftService.assignCoach(id, null);

        // Unassign: Das Repository darf mit null gar nicht befragt werden,
        // findById(null) wirft bei Spring Data.
        assertThat(result.coach()).isNull();
        verify(mockUserRepo, never()).findById(any());
        verify(mockShiftRepo).save(any(Shift.class));
    }

    @Test
    void assignCoach_throwsNotFound_whenShiftDoesNotExist() {
        UUID id = UUID.randomUUID();
        UUID coachId = UUID.randomUUID();
        when(mockShiftRepo.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shiftService.assignCoach(id, coachId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No shift found with id: " + id);

        // Die Shift-Pruefung kommt zuerst -> der Coach wird nicht mehr geladen.
        verify(mockUserRepo, never()).findById(any());
        verify(mockShiftRepo, never()).save(any());
    }

    @Test
    void assignCoach_throwsNotFound_whenCoachDoesNotExist() {
        UUID id = UUID.randomUUID();
        UUID unknownCoachId = UUID.randomUUID();
        User previousCoach = coach(UUID.randomUUID());
        Shift existingShift = shift(id, previousCoach, cohort(UUID.randomUUID()));
        when(mockShiftRepo.findById(id)).thenReturn(Optional.of(existingShift));
        when(mockUserRepo.findById(unknownCoachId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shiftService.assignCoach(id, unknownCoachId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No coach found with id: " + unknownCoachId);

        // Die bestehende Zuordnung bleibt unangetastet – nicht speichern und
        // auch nicht vorher auf null setzen.
        assertThat(existingShift.getCoach()).isEqualTo(previousCoach);
        verify(mockShiftRepo, never()).save(any());
    }

}
