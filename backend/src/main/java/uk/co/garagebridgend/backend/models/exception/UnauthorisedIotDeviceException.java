package uk.co.garagebridgend.backend.models.exception;

/**
 * Exception thrown when an IoT device fails authentication.
 */
public class UnauthorisedIotDeviceException extends RuntimeException {
    /** Exception thrown when an IoT device fails authentication. */
    public UnauthorisedIotDeviceException() {
        super("IoT device unauthenticated.");
    }
}
