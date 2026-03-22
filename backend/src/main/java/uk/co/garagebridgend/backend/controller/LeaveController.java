package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.LeaveService;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;

import java.util.List;

/**
 * REST controller exposing endpoints for retrieving leave information.
 */
@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveController {

    /** Service responsible for handling leave-related business logic. */
    private final LeaveService leaveService;

    /**
     * Retrieves all leave entries formatted for calendar display.
     *
     * @return a list of {@link LeaveCalendarResponse} objects containing leave start and end dates
     */
    @GetMapping("/calendar")
    public List<LeaveCalendarResponse> getCalendarLeave() {
        try {
            return leaveService.getAllLeaveDates();
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }

    /**
     * Retrieves all employees on leave for a specific day.
     *
     * @param date the date string provided in the request path
     * @return a list of {@link LeaveDayResponse} objects representing employees on leave
     */
    @GetMapping("/day/{date}")
    public List<LeaveDayResponse> getLeaveForDay(final @PathVariable String date) {
        try {
            return leaveService.getLeaveForDate(date);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }

    /**
     * Retrieves a summary of leave for the currently authenticated user.
     *
     * @return a {@link LeaveSummaryResponse} object containing leave summary details
     * @throws ResponseStatusException with {@link org.springframework.http.HttpStatus#INTERNAL_SERVER_ERROR}
     * if the user is not authenticated or an unexpected error occurs
     */
    @GetMapping("/summary")
    public LeaveSummaryResponse getSummary() {
        try {
            return leaveService.getLeaveSummaryForCurrentUser();
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

}
