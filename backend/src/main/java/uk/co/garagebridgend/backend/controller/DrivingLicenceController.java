package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DrivingLicenceService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.request.UploadDrivingLicenceRequest;
import uk.co.garagebridgend.backend.models.response.DrivingLicenceResponse;

/**
 * REST controller exposing driving licence endpoints.
 */
@RestController
@RequestMapping("/api/driving-licence")
@RequiredArgsConstructor
public class DrivingLicenceController {

    /** Logger for logging driving licence related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(DrivingLicenceController.class);

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
            LOG.error("Error retrieving driving licence", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error."
            );
        }
    }

    @RestController
    @RequestMapping("/api/admin/driving-licence")
    @RequiredArgsConstructor
    public class DrivingLicenceAdminController {

        private static final Logger LOG = LoggerFactory.getLogger(DrivingLicenceAdminController.class);

        private final DrivingLicenceService drivingLicenceService;

        @PostMapping
        @ResponseStatus(HttpStatus.CREATED)
        public void uploadDrivingLicence(@RequestBody UploadDrivingLicenceRequest request) {
            try {
                drivingLicenceService.uploadLicenceForEmployee(request);
            } catch (AuthenticatedAccountNotFoundException e) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found.");
            } catch (Exception e) {
                LOG.error("Error uploading driving licence", e);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
            }
        }
    }
}
