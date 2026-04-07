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
import uk.co.garagebridgend.backend.models.response.ClockInStatusResponse;

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
     * authenticated user's stats for the current month.
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
     * Accepts an issue report for a clock-in record from the authenticated user.
     * @param body the request body containing the issue description
     */
    @PostMapping("/report")
    public void reportIssue(final @RequestBody ClockInReportRequest body) {
        try {
            clockInService.reportIssue(body.getIssue());
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
