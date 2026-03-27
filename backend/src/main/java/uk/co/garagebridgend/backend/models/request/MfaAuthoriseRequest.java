package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object used to represent an MFA (Multi-Factor Authentication) authorization request.
 * This DTO contains the MFA code provided by the user for authentication.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MfaAuthoriseRequest {
    /** The MFA code provided by the user for authentication. */
    private String code;
}
