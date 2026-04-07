package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.ClockInService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.ClockInReportRequest;
import uk.co.garagebridgend.backend.models.response.ClockInRecordResponse;
import uk.co.garagebridgend.backend.models.response.ClockInStatusResponse;

import java.util.List;

/**
 * REST controller for clock-in related endpoints.
 *
 * <p>Exposes endpoints for retrieving yesterday's clock-in activity and monthly
 * stats, and for submitting an issue report against a clock-in record.
 */
@RestController
@RequestMapping("/api/clock")
@RequiredArgsConstructor
public class ClockInController {

    /** Service for handling clock-in operations and statistics. */
    private final ClockInService clockInService;

    /**
     * Returns yesterday's clock-in and clock-out times alongside the
     * authenticated user's stats for the current year.
     * @return a ClockInStatusResponse containing times and stats
     */
    @GetMapping("/status")
    public ClockInStatusResponse getStatus() {
        try {
            return clockInService.getStatus();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    /**
     * Returns the most recent clock-in records for the authenticated user,
     * used to populate the report issue dropdown on the frontend.
     * @return a list of recent ClockInRecordResponse objects
     */
    @GetMapping("/records")
    public List<ClockInRecordResponse> getRecentRecords() {
        try {
            return clockInService.getRecentRecords();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    /**
     * Accepts an issue report for a specific clock-in record from the authenticated user.
     * @param body the request body containing the clock ID and issue description
     */
    @PostMapping("/report")
    public void reportIssue(final @RequestBody ClockInReportRequest body) {
        try {
            clockInService.reportIssue(body.getClockId(), body.getIssue());
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }
}