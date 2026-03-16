package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.HazardService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.HazardReportRequest;

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
    public void reportHazard(@RequestBody HazardReportRequest body) {
        try {
            hazardService.report(body);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }
}
