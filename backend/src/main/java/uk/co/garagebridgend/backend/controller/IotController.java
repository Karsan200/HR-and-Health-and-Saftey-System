package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.IotService;
import uk.co.garagebridgend.backend.models.exception.UnauthorisedIotDeviceException;
import uk.co.garagebridgend.backend.models.request.IotAttendanceUploadRequest;

import java.util.UUID;

@RestController
@RequestMapping("/api/iot")
@RequiredArgsConstructor
public class IotController {
    /** Logger for logging IoT-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(IotController.class);

    /** Service for handling IoT-related business logic. */
    private final IotService iotService;

    /**
     * Endpoint for IoT devices to upload attendance data.
     *
     * <p>Devices must include the following headers for authentication:
     * - X-Device-Id: UUID of the device
     * - X-Device-Token: Access token for the device
     *
     * <p>The request body should contain the attendance data in the format defined by IotAttendanceUploadRequest.
     *
     * @param deviceId UUID of the IoT device, extracted from the X-Device-Id header
     * @param deviceToken Access token for the IoT device, extracted from the X-Device-Token header
     * @param body The attendance data uploaded by the device
     */
    @PostMapping("/attendance/upload")
    public void uploadAttendance(
            @RequestHeader("X-Device-Id") UUID deviceId,
            @RequestHeader("X-Device-Token") String deviceToken,
            @RequestBody IotAttendanceUploadRequest body
    ) {
        try {
            // Authorise the device
            iotService.authorise(deviceId, deviceToken);

            // Process the attendance upload
            // TODO: Implement the logic to handle the attendance upload, e.g. save to database, trigger events, etc.
        } catch (UnauthorisedIotDeviceException e) {
            LOG.warn("Unauthorised access attempt from IoT device with ID: {}", deviceId);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Unauthorised IoT device"
            );
        } catch (Exception e) {
            LOG.error("Error uploading from IoT device with ID: {}", deviceId, e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }

}
