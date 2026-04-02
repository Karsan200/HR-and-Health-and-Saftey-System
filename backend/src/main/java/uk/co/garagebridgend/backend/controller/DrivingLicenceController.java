package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DrivingLicenceService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.DrivingLicenceResponse;

/**
 * REST controller exposing driving licence endpoints.
 */
@RestController
@RequestMapping("/api/driving-licence")
@RequiredArgsConstructor
public class DrivingLicenceController {

    /** Service for handling driving licence operations. */
    private final DrivingLicenceService drivingLicenceService;

    /**
     * Retrieves the most recent driving licence for the currently authenticated user.
     *
     * @return a DrivingLicenceResponse containing the title and pre-signed URL
     */
    @GetMapping
    public DrivingLicenceResponse getDrivingLicence() {
        try {
            return drivingLicenceService.getDrivingLicenceForCurrentUser();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (NotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No driving licence found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }
}