package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.AttendanceService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.BleSignatureResponse;

/**
 * Controller for handling attendance-related API endpoints.
 */
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    /** Logger for logging attendance-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(AttendanceController.class);

    /** Service for handling attendance-related business logic. */
    private final AttendanceService attendanceService;

    /**
     * Endpoint to retrieve the BLE signature for the authenticated user.
     * @return BleSignatureResponse response containing the BLE signature.
     */
    @GetMapping("/signature")
    public BleSignatureResponse getSignature() {
        try {
            return attendanceService.getBleSignature();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            LOG.error("Error retrieving the BLE signature", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }
}
