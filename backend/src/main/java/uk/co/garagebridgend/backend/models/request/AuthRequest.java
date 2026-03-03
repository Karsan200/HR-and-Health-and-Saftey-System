package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for user authentication, containing email and password.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    /** User's email address. */
    private String email;

    /** User's plaintext password. */
    private String password;
}
