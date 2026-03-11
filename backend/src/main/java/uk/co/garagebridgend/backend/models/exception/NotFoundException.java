package uk.co.garagebridgend.backend.models.exception;

/**
 * Exception thrown when a requested resource is not found.
 */
public class NotFoundException extends RuntimeException {
    /** Constructs a new NotFoundException.
     * @param message the detail message for the exception
     * */
    public NotFoundException(final String message) {
        super(message);
    }
}
