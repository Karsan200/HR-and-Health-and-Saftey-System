package uk.co.garagebridgend.backend.models.exception;

/**
 * Exception thrown when a user provides an invalid password/pin code during authentication.
 */
public class InvalidPasswordException extends RuntimeException {
    /** Constructs a new InvalidPasswordException with a default message. */
    public InvalidPasswordException(String message) {
        super(message);
    }
}
