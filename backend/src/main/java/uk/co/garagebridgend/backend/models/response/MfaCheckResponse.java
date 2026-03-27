package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Data Transfer Object representing the response for an MFA check.
 * This DTO is used to send information about the MFA setup and authorization status
 * from the backend to the frontend application. It contains the secret key for MFA setup
 * and a boolean indicating whether the user is authorized for MFA or not.
 */
@Data
@AllArgsConstructor
public class MfaCheckResponse {
    /** The secret key used to set up MFA for the user. Null if MFA is already setup. */
    private String secret;

    /** Whether the user is mfa authorised or not. */
    private boolean isMfaAuthorised;
}
