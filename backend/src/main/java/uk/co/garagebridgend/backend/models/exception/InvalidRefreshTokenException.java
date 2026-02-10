package uk.co.garagebridgend.backend.models.exception;

/**
 * Exception thrown when a refresh token is invalid or expired.
 */
public class InvalidRefreshTokenException extends RuntimeException {
    /** Constructs a new InvalidRefreshTokenException with a default message. */
    public InvalidRefreshTokenException() {
        super("Invalid or expired refresh token");
    }
}
