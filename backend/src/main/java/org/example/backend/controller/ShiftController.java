package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.ShiftRequestDto;
import org.example.backend.dto.ShiftResponseDto;
import org.example.backend.exception.MissingQueryParameterException;
import org.example.backend.service.ShiftService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public List<ShiftResponseDto> findShifts(
            @RequestParam(required = false) UUID cohortId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {

        if (cohortId != null) {
            return shiftService.findShiftsOfCohort(cohortId);
        }
        if (from != null && to != null) {
            return shiftService.findShiftsBetween(from, to);
        }
        throw new MissingQueryParameterException(
                "Provide either 'cohortId' or both 'from' and 'to'");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShiftResponseDto createShift(@Valid @RequestBody ShiftRequestDto shiftRequestDto) {
        return shiftService.createShift(shiftRequestDto);
    }

    @PutMapping("/{id}")
    public ShiftResponseDto updateShift(@PathVariable UUID id, @Valid @RequestBody ShiftRequestDto shiftRequestDto) {
        return shiftService.updateShift(id, shiftRequestDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteShiftById(@PathVariable UUID id) {
        shiftService.deleteShiftById(id);
    }

}
