package uk.co.garagebridgend.backend.models.internal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal model used to represent the result of rotating a refresh token,
 * containing both the new refresh token and the new access token. This is
 * used internally in the service layer when rotating tokens, and is not
 * exposed directly to clients.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RotateRefreshTokenInternal {
    /** Refresh token used to issue a new access token. */
    private String refreshToken;

    /** New access token issued from the refresh token. */
    private String accessToken;
}
