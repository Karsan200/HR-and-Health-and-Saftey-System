package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.ClockInAdminService;
import uk.co.garagebridgend.backend.models.request.ClockInOverrideRequest;
import uk.co.garagebridgend.backend.models.response.ClockInAdminResponse;

import java.time.LocalDate;
import java.util.List;
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
}
