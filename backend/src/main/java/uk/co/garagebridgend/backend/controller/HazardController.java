package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.HazardService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.HazardReportRequest;

import java.util.NoSuchElementException;

/**
 * REST controller for handling hazard-related endpoints.
 *
 * <p>Exposes an endpoint to report a new hazard, which accepts a request body containing
 * the hazard report details and files to upload. The controller relies on Spring Security
 * to obtain the current authentication from the SecurityContextHolder and uses the HazardService
 * to process the hazard report.
 */
@RestController
@RequestMapping("/api/hazard")
@RequiredArgsConstructor
public class HazardController {
    /** Service for handling hazard-related operations. */
    private final HazardService hazardService;

    /**
     * Endpoint to report a new hazard.
     * @param body The request body containing the hazard report details and files to upload.
     */
    @PostMapping("/report")
    public void reportHazard(final @RequestBody HazardReportRequest body) {
        try {
            hazardService.report(body);
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
                    "Internal sever error"
            );
        }
    }

    @PutMapping("/report/{id}")
    public void updateHazard(@PathVariable final Long id, @RequestBody final HazardReportRequest body) {
        try {
            hazardService.update(id, body);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated account not found.");
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}
