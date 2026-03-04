package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for user authentication, containing username, password and whether it's for the mobile app or not.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    /** User's username address. */
    private String username;

    /** User's plaintext password. */
    private String password;

    /** Whether the user is logging in from the mobile app. */
    private boolean isMobile;
}
