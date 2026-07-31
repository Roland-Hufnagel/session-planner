package org.example.backend.controller;

import org.example.backend.dto.CohortResponseDto;
import org.example.backend.dto.ShiftRequestDto;
import org.example.backend.dto.ShiftResponseDto;
import org.example.backend.dto.UserResponseDto;
import org.example.backend.exception.InvalidDateRangeException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Department;
import org.example.backend.model.FederalState;
import org.example.backend.model.Role;
import org.example.backend.service.ShiftService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ShiftController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShiftControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShiftService mockShiftService;

    private static final LocalDate DATE = LocalDate.of(2026, Month.AUGUST, 5);

    /** Eine vollstaendige Shift-Antwort samt verschachteltem Coach und Cohort. */
    private static ShiftResponseDto shiftResponse(UUID id) {
        UserResponseDto coach = new UserResponseDto(
                UUID.randomUUID(), "Peter Klein", "Pete", Role.COACH,
                "peterk", "peterk@neuefische.de", null, true);
        CohortResponseDto cohort = new CohortResponseDto(
                UUID.randomUUID(), "java-25-3", "Die Coffeebeans",
                LocalDate.of(2026, Month.AUGUST, 3), LocalDate.of(2027, Month.FEBRUARY, 26),
                FederalState.HH, Department.JAVA, "#D93500");
        return new ShiftResponseDto(
                id, "Morning session", DATE,
                LocalTime.of(9, 0), LocalTime.of(12, 30), coach, cohort);
    }

    private static final String VALID_BODY = """
            {
              "title": "Morning session",
              "date": "2026-08-05",
              "startTime": "09:00",
              "endTime": "12:30",
              "coachId": "3f2a8f1e-0000-4000-8000-000000000001",
              "cohortId": "3f2a8f1e-0000-4000-8000-000000000002"
            }
            """;

    // ----- findShiftsBetween -----
    @Test
    void findShiftsBetween_returns200AndShiftList() throws Exception {
        when(mockShiftService.findShiftsBetween(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(shiftResponse(UUID.randomUUID())));

        mockMvc.perform(get("/api/shifts")
                        .param("from", "2026-08-03")
                        .param("to", "2026-08-09"))
                .andExpect(status().isOk()) // 200
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Morning session"))
                .andExpect(jsonPath("$[0].startTime").value("09:00:00"))
                // Coach und Cohort kommen als verschachtelte DTOs mit
                .andExpect(jsonPath("$[0].coach.nickname").value("Pete"))
                .andExpect(jsonPath("$[0].cohort.name").value("java-25-3"));
    }

    @Test
    void findShiftsBetween_returns200AndEmptyList_whenNoShiftsInRange() throws Exception {
        when(mockShiftService.findShiftsBetween(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/shifts")
                        .param("from", "2026-08-03")
                        .param("to", "2026-08-09"))
                .andExpect(status().isOk()) // kein 404: ein leerer Zeitraum ist kein Fehler
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void findShiftsBetween_returns400_whenRangeIsInvalid() throws Exception {
        when(mockShiftService.findShiftsBetween(any(LocalDate.class), any(LocalDate.class)))
                .thenThrow(new InvalidDateRangeException(
                        "Date range must not exceed 30 days, but was 40 days"));

        mockMvc.perform(get("/api/shifts")
                        .param("from", "2026-08-03")
                        .param("to", "2026-09-11"))
                .andExpect(status().isBadRequest()) // 400
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        "Date range must not exceed 30 days, but was 40 days"))
                .andExpect(jsonPath("$.validationErrors").doesNotExist());
    }

    @Test
    void findShifts_returns400_whenOnlyFromIsGiven() throws Exception {
        // Die Route kennt zwei Abfragewege; ein halber Zeitraum ist keiner davon.
        mockMvc.perform(get("/api/shifts").param("from", "2026-08-03"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        "Provide either 'cohortId' or both 'from' and 'to'"));

        verify(mockShiftService, never()).findShiftsBetween(any(), any());
        verify(mockShiftService, never()).findShiftsOfCohort(any());
    }

    @Test
    void findShifts_returns400_whenNoParameterIsGiven() throws Exception {
        // Ohne Filter bewusst kein Ergebnis: "alle Shifts" waechst unbegrenzt.
        mockMvc.perform(get("/api/shifts"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Provide either 'cohortId' or both 'from' and 'to'"));

        verify(mockShiftService, never()).findShiftsBetween(any(), any());
        verify(mockShiftService, never()).findShiftsOfCohort(any());
    }

    // ----- findShifts: der cohortId-Weg -----
    @Test
    void findShifts_returns200AndShiftsOfCohort() throws Exception {
        UUID cohortId = UUID.randomUUID();
        when(mockShiftService.findShiftsOfCohort(cohortId))
                .thenReturn(List.of(shiftResponse(UUID.randomUUID())));

        mockMvc.perform(get("/api/shifts").param("cohortId", cohortId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Morning session"));

        // Der cohortId-Weg umgeht die 30-Tage-Regel bewusst
        verify(mockShiftService, never()).findShiftsBetween(any(), any());
    }

    @Test
    void findShifts_returns404_whenCohortDoesNotExist() throws Exception {
        UUID cohortId = UUID.randomUUID();
        when(mockShiftService.findShiftsOfCohort(cohortId))
                .thenThrow(new ResourceNotFoundException("No cohort found with id: " + cohortId));

        mockMvc.perform(get("/api/shifts").param("cohortId", cohortId.toString()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No cohort found with id: " + cohortId));
    }

    @Test
    void findShifts_prefersCohortId_whenBothAreGiven() throws Exception {
        UUID cohortId = UUID.randomUUID();
        when(mockShiftService.findShiftsOfCohort(cohortId)).thenReturn(List.of());

        mockMvc.perform(get("/api/shifts")
                        .param("cohortId", cohortId.toString())
                        .param("from", "2026-08-03")
                        .param("to", "2026-08-09"))
                .andExpect(status().isOk());

        verify(mockShiftService).findShiftsOfCohort(cohortId);
        verify(mockShiftService, never()).findShiftsBetween(any(), any());
    }

    @Test
    void findShiftsBetween_returns400_whenDateFormatIsInvalid() throws Exception {
        // Deutsches Datumsformat -> die Konvertierung scheitert vor dem Controller.
        mockMvc.perform(get("/api/shifts")
                        .param("from", "03.08.2026")
                        .param("to", "2026-08-09"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Invalid value for 'from': 03.08.2026"));

        verify(mockShiftService, never()).findShiftsBetween(any(), any());
    }

    // ----- createShift -----
    @Test
    void createShift_returns201AndCreatedShift() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockShiftService.createShift(any(ShiftRequestDto.class))).thenReturn(shiftResponse(id));

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isCreated()) // 201
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Morning session"));
    }

    @Test
    void createShift_returns400_whenBodyIsInvalid() throws Exception {
        String invalidBody = """
                {
                  "title": "", "date": null,
                  "startTime": null, "endTime": null,
                  "coachId": null, "cohortId": null
                }
                """;

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.title").exists())
                .andExpect(jsonPath("$.validationErrors.date").exists())
                .andExpect(jsonPath("$.validationErrors.startTime").exists())
                .andExpect(jsonPath("$.validationErrors.endTime").exists())
                .andExpect(jsonPath("$.validationErrors.cohortId").exists())
                // coachId darf null sein -> kein Validierungsfehler
                .andExpect(jsonPath("$.validationErrors.coachId").doesNotExist());

        verify(mockShiftService, never()).createShift(any());
    }

    @Test
    void createShift_returns404_whenCohortDoesNotExist() throws Exception {
        when(mockShiftService.createShift(any(ShiftRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("No cohort found with id: 3f2a8f1e"));

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isNotFound()) // 404
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("No cohort found with id: 3f2a8f1e"));
    }

    @Test
    void createShift_returns400_whenEndTimeIsNotAfterStartTime() throws Exception {
        when(mockShiftService.createShift(any(ShiftRequestDto.class)))
                .thenThrow(new InvalidDateRangeException(
                        "'endTime' must be after 'startTime': 18:00 >= 09:00"));

        mockMvc.perform(post("/api/shifts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value(
                        "'endTime' must be after 'startTime': 18:00 >= 09:00"));
    }

    // ----- updateShift -----
    @Test
    void updateShift_returns200AndUpdatedShift() throws Exception {
        UUID id = UUID.randomUUID();
        // if one argument is a matcher then all arguments have to be matchers (-> 'eq(id)')
        when(mockShiftService.updateShift(eq(id), any(ShiftRequestDto.class)))
                .thenReturn(shiftResponse(id));

        mockMvc.perform(put("/api/shifts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Morning session"));
    }

    @Test
    void updateShift_returns400_whenBodyIsInvalid() throws Exception {
        UUID id = UUID.randomUUID();
        String invalidBody = """
                {
                  "title": "", "date": "2026-08-05",
                  "startTime": null, "endTime": "12:30",
                  "coachId": null, "cohortId": "3f2a8f1e-0000-4000-8000-000000000002"
                }
                """;

        mockMvc.perform(put("/api/shifts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.title").exists())
                .andExpect(jsonPath("$.validationErrors.startTime").exists());

        verify(mockShiftService, never()).updateShift(any(), any());
    }

    @Test
    void updateShift_returns404_whenShiftDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockShiftService.updateShift(eq(id), any(ShiftRequestDto.class)))
                .thenThrow(new ResourceNotFoundException("No shift found with id: " + id));

        mockMvc.perform(put("/api/shifts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No shift found with id: " + id));
    }

    // ----- deleteShiftById -----
    @Test
    void deleteShiftById_returns204_whenShiftExists() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/shifts/{id}", id))
                .andExpect(status().isNoContent()); // 204

        verify(mockShiftService).deleteShiftById(id);
    }

    @Test
    void deleteShiftById_returns404_whenShiftDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        // deleteShiftById gibt nichts zurueck -> doThrow statt when(...)
        doThrow(new ResourceNotFoundException("No shift found with id: " + id))
                .when(mockShiftService).deleteShiftById(id);

        mockMvc.perform(delete("/api/shifts/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("No shift found with id: " + id));
    }

}
