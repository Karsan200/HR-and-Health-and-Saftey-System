package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object used to represent an IoT attendance upload request.
 * This DTO is used by the backend to receive attendance data from IoT devices.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IotAttendanceUploadRequest {
    /** The BLE Signatures of the attendance record. */
    private UUID[] signatures;

    /** The timestamp of the attendance record in ISO 8601 format. */
    private LocalDateTime timestamp;
}
