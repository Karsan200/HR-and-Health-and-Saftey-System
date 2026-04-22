package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.ClockInAdminService;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.request.ClockInCreateRequest;
import uk.co.garagebridgend.backend.models.request.ClockInOverrideRequest;
import uk.co.garagebridgend.backend.models.response.AccountSearchResponse;
import uk.co.garagebridgend.backend.models.response.ClockInAdminResponse;
import uk.co.garagebridgend.backend.models.response.TodaysClockInsResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller exposing admin-only clock-in endpoints.
 * All routes are prefixed with /api/admin and require admin or manager authority
 * as enforced in SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ClockInAdminController {

    /** Logger for this controller. */
    private static final Logger LOG = LoggerFactory.getLogger(ClockInAdminController.class);

    /** Service for admin clock-in operations. */
    private final ClockInAdminService clockInAdminService;

    /**
     * Returns all clock-in records for the given date across all employees,
     * with any associated employee report attached.
     *
     * @param date the date to query in YYYY-MM-DD format
     * @return a list of clock-in records for that day
     */
    @GetMapping("/clock-ins")
    public List<ClockInAdminResponse> getClockInsForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate date
    ) {
        try {
            return clockInAdminService.getClockInsForDate(date);
        } catch (Exception e) {
            LOG.error("Error retrieving admin clock-ins for date {}", date, e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    /**
     * Returns all clock-in records across all employees and all dates.
     * Used when the admin enables the "show all" toggle on the overrides page.
     *
     * @return a list of all clock-in records
     */
    @GetMapping("/clock-ins/all")
    public List<ClockInAdminResponse> getAllClockIns() {
        try {
            return clockInAdminService.getAllClockIns();
        } catch (Exception e) {
            LOG.error("Error retrieving all admin clock-ins", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    @GetMapping("/clock-in-events/today")
    public List<TodaysClockInsResponse> getTodaysClockIns(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) final LocalDate date) {
        try {
            return clockInAdminService.getTodaysClockIns(date != null ? date : LocalDate.now());
        } catch (Exception e) {
            LOG.error("Error retrieving today's clock-in events", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error.");
        }
    }

    /**
     * Applies an admin override to a specific clock-in record, replacing
     * the existing times with those supplied in the request body.
     *
     * @param clockId  the UUID of the clock-in record to update
     * @param override the new clock-in and clock-out times
     */
    @PostMapping("/clock-ins/{clockId}/override")
    public void overrideClockIn(
            @PathVariable final UUID clockId,
            @RequestBody final ClockInOverrideRequest override
    ) {
        try {
            clockInAdminService.overrideClockIn(clockId, override);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            LOG.error("Error applying clock-in override for clockId {}", clockId, e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    /**
     * Creates a new clock-in record for a specific employee on a given date.
     * Returns 201 Created with the database-assigned UUID so the frontend can
     * use the real ID immediately without needing to reload the list.
     *
     * @param request the details of the record to create
     * @return 201 Created with body {@code { "clockId": "<uuid>" }}
     */
    @PostMapping("/clock-ins")
    public ResponseEntity<Map<String, UUID>> createClockIn(@RequestBody final ClockInCreateRequest request) {
        try {
            ClockInTable saved = clockInAdminService.createClockIn(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Content-Type", "application/json")
                    .body(Map.of("clockId", saved.getClockInId()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            LOG.error("Error creating clock-in record", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    /**
     * Permanently deletes a clock-in record and any associated report.
     * Requires admin or manager authority (enforced in SecurityConfig).
     *
     * @param clockId the UUID of the clock-in record to delete
     */
    @DeleteMapping("/clock-ins/{clockId}")
    public void deleteClockIn(@PathVariable final UUID clockId) {
        try {
            clockInAdminService.deleteClockIn(clockId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            LOG.error("Error deleting clock-in record for clockId {}", clockId, e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    /**
     * Searches for employee accounts whose name contains the given query string
     * (case-insensitive). Returns up to 10 results ordered alphabetically.
     * Used by the admin clock-in autocomplete dropdown.
     *
     * @param query the partial name to search for
     * @return a list of matching account summaries
     */
    @GetMapping("/accounts/search")
    public List<AccountSearchResponse> searchAccounts(@RequestParam final String query) {
        try {
            return clockInAdminService.searchAccounts(query);
        } catch (Exception e) {
            LOG.error("Error searching accounts with query '{}'", query, e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }
}
