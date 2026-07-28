package org.example.backend.controller;

import org.example.backend.dto.CohortRequestDto;
import org.example.backend.dto.CohortResponseDto;
import org.example.backend.exception.DuplicateResourceException;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.model.Department;
import org.example.backend.model.FederalState;
import org.example.backend.service.CohortService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CohortController.class)
@AutoConfigureMockMvc(addFilters = false)
class CohortControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CohortService mockCohortService;

    // ----- findAllCohorts -----
    @Test
    void findAllCohorts_returns200AndCohortList() throws Exception {
        CohortResponseDto cohortResponseDto = new CohortResponseDto(
                UUID.randomUUID(), "java-25-3", "Die Coffeebeans",
                LocalDate.of(2025, Month.SEPTEMBER, 1), LocalDate.of(2026, Month.FEBRUARY, 27),
                FederalState.HH, Department.JAVA, "#D93500");
        when(mockCohortService.findAllCohorts()).thenReturn(List.of(cohortResponseDto));

        mockMvc.perform(get("/api/cohorts"))
                .andExpect(status().isOk()) // 200
                .andExpect(jsonPath("$.length()").value(1)) // We expect a list with one element
                .andExpect(jsonPath("$[0].name").value("java-25-3"))
                .andExpect(jsonPath("$[0].federalState").value("HH"))
                .andExpect(jsonPath("$[0].department").value("JAVA"));
    }

    // ----- findCohortById -----
    @Test
    void findCohortById_returns200AndCohort() throws Exception {
        UUID id = UUID.randomUUID();
        CohortResponseDto cohortResponseDto = new CohortResponseDto(
                id, "java-25-3", "Die Coffeebeans",
                LocalDate.of(2025, Month.SEPTEMBER, 1), LocalDate.of(2026, Month.FEBRUARY, 27),
                FederalState.HH, Department.JAVA, "#D93500");
        when(mockCohortService.findCohortById(id)).thenReturn(cohortResponseDto);

        mockMvc.perform(get("/api/cohorts/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("java-25-3"))
                // LocalDate is serialized as ISO string, not as an array
                .andExpect(jsonPath("$.startDate").value("2025-09-01"))
                .andExpect(jsonPath("$.endDate").value("2026-02-27"));
    }

    @Test
    void findCohortById_returns404_whenCohortDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockCohortService.findCohortById(id))
                .thenThrow(new ResourceNotFoundException(
                        "No cohort found with id: " + id));

        mockMvc.perform(get("/api/cohorts/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(
                        "No cohort found with id: " + id))
                .andExpect(jsonPath("$.validationErrors").doesNotExist());
    }

    // ----- createCohort -----
    @Test
    void createCohort_returns201AndCreatedCohort() throws Exception {
        UUID id = UUID.randomUUID();
        CohortResponseDto cohortResponseDto = new CohortResponseDto(
                id, "java-25-3", "Die Coffeebeans",
                LocalDate.of(2025, Month.SEPTEMBER, 1), LocalDate.of(2026, Month.FEBRUARY, 27),
                FederalState.HH, Department.JAVA, "#D93500");
        when(mockCohortService.createCohort(any(CohortRequestDto.class))).thenReturn(cohortResponseDto);

        String requestBody = """
                {
                  "name": "java-25-3",
                  "nickname": "Die Coffeebeans",
                  "startDate": "2025-09-01",
                  "endDate": "2026-02-27",
                  "federalState": "HH",
                  "department": "JAVA",
                  "colorCode": "#D93500"
                }
                """;

        mockMvc.perform(post("/api/cohorts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())                       // 201
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("java-25-3"));
    }

    @Test
    void createCohort_returns400_whenBodyIsInvalid() throws Exception {
        // blank Strings and nulls only: the body must still be parsable by Jackson,
        // otherwise Spring answers with a ProblemDetail instead of our ApiError
        String invalidBody = """
                {
                  "name": "",
                  "nickname": "Die Coffeebeans",
                  "startDate": null,
                  "endDate": null,
                  "federalState": null,
                  "department": null,
                  "colorCode": ""
                }
                """;

        mockMvc.perform(post("/api/cohorts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())                    // 400
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.startDate").exists())
                .andExpect(jsonPath("$.validationErrors.endDate").exists())
                .andExpect(jsonPath("$.validationErrors.federalState").exists())
                .andExpect(jsonPath("$.validationErrors.department").exists())
                .andExpect(jsonPath("$.validationErrors.colorCode").exists());

        verify(mockCohortService, never()).createCohort(any()); // verify service is never reached.
    }

    @Test
    void createCohort_returns409_whenNameAlreadyExists() throws Exception {
        when(mockCohortService.createCohort(any(CohortRequestDto.class)))
                .thenThrow(new DuplicateResourceException("Cohort already exists: java-25-3"));

        String requestBody = """
                {
                  "name": "java-25-3",
                  "nickname": "Die Coffeebeans",
                  "startDate": "2025-09-01",
                  "endDate": "2026-02-27",
                  "federalState": "HH",
                  "department": "JAVA",
                  "colorCode": "#D93500"
                }
                """;

        mockMvc.perform(post("/api/cohorts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())                      // 409
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Cohort already exists: java-25-3"))
                .andExpect(jsonPath("$.validationErrors").doesNotExist());
    }

    // ----- updateCohort -----
    @Test
    void updateCohort_returns200AndUpdatedCohort() throws Exception {
        UUID id = UUID.randomUUID();
        CohortResponseDto cohortResponseDto = new CohortResponseDto(
                id, "java-25-3", "Die Bohnen",
                LocalDate.of(2025, Month.SEPTEMBER, 1), LocalDate.of(2026, Month.MARCH, 31),
                FederalState.BE, Department.JAVA, "#0057B8");
        // if one argument is a matcher ('any(CohortRequestDto.class)') then all arguments have to be matcher (-> 'eq(id)')
        when(mockCohortService.updateCohort(eq(id), any(CohortRequestDto.class))).thenReturn(cohortResponseDto);

        String requestBody = """
                {
                  "name": "java-25-3", "nickname": "Die Bohnen",
                  "startDate": "2025-09-01", "endDate": "2026-03-31",
                  "federalState": "BE", "department": "JAVA", "colorCode": "#0057B8"
                }
                """;

        mockMvc.perform(put("/api/cohorts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("Die Bohnen"))
                .andExpect(jsonPath("$.federalState").value("BE"))
                .andExpect(jsonPath("$.endDate").value("2026-03-31"));
    }

    @Test
    void updateCohort_returns400_whenBodyIsInvalid() throws Exception {
        UUID id = UUID.randomUUID();
        String invalidBody = """
                {
                  "name": "", "nickname": "Die Bohnen",
                  "startDate": null, "endDate": "2026-03-31",
                  "federalState": "BE", "department": "JAVA", "colorCode": ""
                }
                """;

        mockMvc.perform(put("/api/cohorts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.startDate").exists())
                .andExpect(jsonPath("$.validationErrors.colorCode").exists());

        verify(mockCohortService, never()).updateCohort(any(), any());
    }

    @Test
    void updateCohort_returns404_whenCohortDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockCohortService.updateCohort(eq(id), any(CohortRequestDto.class)))
                .thenThrow(new ResourceNotFoundException(
                        "No cohort found with id: " + id));

        String requestBody = """
                {
                  "name": "java-25-3", "nickname": "Die Bohnen",
                  "startDate": "2025-09-01", "endDate": "2026-03-31",
                  "federalState": "BE", "department": "JAVA", "colorCode": "#0057B8"
                }
                """;

        mockMvc.perform(put("/api/cohorts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(
                        "No cohort found with id: " + id));
    }

    @Test
    void updateCohort_returns409_whenNameBelongsToAnotherCohort() throws Exception {
        UUID id = UUID.randomUUID();
        when(mockCohortService.updateCohort(eq(id), any(CohortRequestDto.class)))
                .thenThrow(new DuplicateResourceException("Cohort Name already exists: java-25-3"));

        String requestBody = """
                {
                  "name": "java-25-3", "nickname": "Die Bohnen",
                  "startDate": "2025-09-01", "endDate": "2026-03-31",
                  "federalState": "BE", "department": "JAVA", "colorCode": "#0057B8"
                }
                """;

        mockMvc.perform(put("/api/cohorts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Cohort Name already exists: java-25-3"));
    }

    // ----- deleteCohort -----
    @Test
    void deleteCohortById_returns204_whenCohortExists() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/cohorts/{id}", id))
                .andExpect(status().isNoContent());          // 204

        verify(mockCohortService).deleteCohortById(id);
    }

    @Test
    void deleteCohortById_returns404_whenCohortDoesNotExist() throws Exception {
        UUID id = UUID.randomUUID();
        // since deleteCohortById does not return anything you can not use 'when(...)'
        // instead use it the other way round:
        doThrow(new ResourceNotFoundException("No cohort found with id: " + id))
                .when(mockCohortService).deleteCohortById(id);

        mockMvc.perform(delete("/api/cohorts/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(
                        "No cohort found with id: " + id));
    }

}
