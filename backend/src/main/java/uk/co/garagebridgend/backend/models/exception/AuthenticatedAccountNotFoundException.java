package uk.co.garagebridgend.backend.models.exception;

public class AuthenticatedAccountNotFoundException extends RuntimeException {
    public AuthenticatedAccountNotFoundException() {
        super("Account not found.");
    }
}
