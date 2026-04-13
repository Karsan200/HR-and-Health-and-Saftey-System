package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import uk.co.garagebridgend.backend.logic.LeaveService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.LeaveDecisionRequest;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarAdminResponse;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.models.response.LeaveTypeResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import uk.co.garagebridgend.backend.models.request.LeaveRequest;
import uk.co.garagebridgend.backend.models.response.PendingLeaveResponse;

import java.util.List;

/**
 * REST controller exposing endpoints for retrieving leave information.
 */
@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveController {
    /** Logger for logging leave-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(LeaveController.class);

    /** Minimum valid month value (January). */
    private static final int MIN_MONTH = 1;

    /** Maximum valid month value (December). */
    private static final int MAX_MONTH = 12;

    /** Service responsible for handling leave-related business logic. */
    private final LeaveService leaveService;

    /**
     * Retrieves all approved leave entries for a given month, expanded into one item
     * per employee per working day on leave. Intended for populating the admin calendar view.
     * Requires ROLE_ADMIN or ROLE_MANAGER authority (enforced in SecurityConfig).
     *
     * @param year the calendar year to query (e.g. 2025)
     * @param month the calendar month to query (1 = January, 12 = December)
     * @return a flat list of {@link LeaveCalendarAdminResponse} objects, one per day per employee
     */
    @GetMapping("/admin/calendar")
    public List<LeaveCalendarAdminResponse> getAdminCalendarItems(
            @RequestParam final int year,
            @RequestParam final int month
    ) {
        if (month < MIN_MONTH || month > MAX_MONTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Month must be between 1 and 12.");
        }
        try {
            return leaveService.getCalendarItems(year, month);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User not authenticated"
            );
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        } catch (Exception e) {
            LOG.error("Error retrieving calendar items for year {} month {}", year, month, e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

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
            LOG.error("Error retrieving calendar leave dates", e);
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
            LOG.error("Error retrieving leave for date {}", date, e);
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
     * @throws ResponseStatusException with {@link HttpStatus#INTERNAL_SERVER_ERROR}
     * if the user is not authenticated or an unexpected error occurs
     */
    @GetMapping("/summary")
    public LeaveSummaryResponse getSummary() {
        try {
            return leaveService.getLeaveSummaryForCurrentUser();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User not authenticated"
            );
        } catch (Exception e) {
            LOG.error("Error retrieving leave summary for current user", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Endpoint to retrieve all leave types for the booking modal.
     *
     * @return a list of available leave types
     */
    @GetMapping("/types")
    public List<LeaveTypeResponse> getLeaveTypes() {
        try {
            return leaveService.getLeaveTypes();
        } catch (Exception e) {
            LOG.error("Error retrieving leave types", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Creates a new leave request for the authenticated user.
     *
     * @param request request body containing leave details
     */
    @PostMapping("/create")
    public void createLeave(@RequestBody final LeaveRequest request) {
        try {
            leaveService.createLeave(request);
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
            LOG.error("Error creating leave request", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Retrieves all leave requests that are currently pending approval.
     * Only accessible to admin and manager roles (enforced in SecurityConfig).
     *
     * @return a list of {@link PendingLeaveResponse} objects, ordered oldest first
     */
    @GetMapping("/admin/pending")
    public List<PendingLeaveResponse> getPendingLeave() {
        try {
            return leaveService.getPendingLeave();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        } catch (Exception e) {
            LOG.error("Error retrieving pending leave requests", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }


    /**
     * Declines a pending leave request.
     * Only accessible to admin and manager roles (enforced in SecurityConfig).
     *
     * @param leaveId  the ID of the leave record to decline
     * @param decision request body containing the optional admin response message
     */
    @PostMapping("/admin/{leaveId}/decline")
    public void declineLeave(
            @PathVariable final Long leaveId,
            @RequestBody final LeaveDecisionRequest decision
    ) {
        try {
            leaveService.declineLeave(leaveId, decision);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            LOG.error("Error declining leave request with ID: {}", leaveId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    /**
     * Approves a pending leave request.
     * Only accessible to admin and manager roles (enforced in SecurityConfig).
     *
     * @param leaveId  the ID of the leave record to approve
     * @param decision request body containing the optional admin response message
     */
    @PostMapping("/admin/{leaveId}/approve")
    public void approveLeave(
            @PathVariable final Long leaveId,
            @RequestBody final LeaveDecisionRequest decision
    ) {
        try {
            leaveService.approveLeave(leaveId, decision);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}
