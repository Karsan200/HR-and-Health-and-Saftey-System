package uk.co.garagebridgend.backend.models.exception;

/**
 * Exception thrown when a user provides an invalid password/pin code during authentication.
 */
public class InvalidPasswordException extends RuntimeException {
    /** Constructs a new InvalidPasswordException with a default message.
     * @param message Custom message to provide more details about the invalid password error.
     */
    public InvalidPasswordException(final String message) {
        super(message);
    }
}
