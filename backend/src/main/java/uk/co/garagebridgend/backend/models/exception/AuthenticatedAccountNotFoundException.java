package uk.co.garagebridgend.backend.models.exception;

/**
 * Exception thrown when an authenticated account cannot be found in the database.
 */
public class AuthenticatedAccountNotFoundException extends RuntimeException {
    /** Constructs a new AuthenticatedAccountNotFoundException with a default message. */
    public AuthenticatedAccountNotFoundException() {
        super("Account not found.");
    }
}
