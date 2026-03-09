package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.LeaveService;
import uk.co.garagebridgend.backend.models.dto.LeaveCalendarDTO;
import uk.co.garagebridgend.backend.models.dto.LeaveDayDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller exposing endpoints for retrieving leave information.
 */
@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
@CrossOrigin
public class LeaveController {

    /** Service responsible for handling leave-related business logic. */
    private final LeaveService leaveService;

    /**
     * Retrieves all leave entries formatted for calendar display.
     *
     * @return a list of {@link LeaveCalendarDTO} objects containing leave start and end dates
     */
    @GetMapping("/calendar")
    public List<LeaveCalendarDTO> getCalendarLeave() {
        return leaveService.getAllLeaveDates();
    }

    /**
     * Retrieves all employees on leave for a specific day.
     *
     * @param date the date string provided in the request path
     * @return a list of {@link LeaveDayDTO} objects representing employees on leave
     */
    @GetMapping("/day/{date}")
    public List<LeaveDayDTO> getLeaveForDay(final @PathVariable String date) {
        try {
            LocalDate parsedDate = LocalDate.parse(date);
            return leaveService.getLeaveForDate(parsedDate);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid date format"
            );
        }
    }
}
