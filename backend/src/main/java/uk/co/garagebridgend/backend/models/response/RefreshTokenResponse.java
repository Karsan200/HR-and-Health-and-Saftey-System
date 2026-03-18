package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload returned when a new access token is issued from a
 * valid refresh token or 2FA authentication.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefreshTokenResponse {
    /** New access token issued from the refresh token. */
    private String accessToken;
}
