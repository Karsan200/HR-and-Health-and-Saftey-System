package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for rotating an access token using a pin code from the
 * mobile app. This is used after the user enters their pin code on the app
 * to then reset the expiration period of their refresh token
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRotateRequest {
    /** Pin Code used to rotate the token from the mobile app. */
    private String pinCode;
}
