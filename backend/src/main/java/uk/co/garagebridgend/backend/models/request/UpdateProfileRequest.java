package uk.co.garagebridgend.backend.models.request;

import lombok.Data;

/**
 * Request payload for updating the currently authenticated user's profile.
 * All fields are optional, only non-null fields will be applied.
 */
@Data
public class UpdateProfileRequest {

    /** Updated email address. Null means no change. */
    private String email;

    /** Updated phone number. Null means no change. */
    private String phoneNumber;

    /** Updated username. Null means no change. */
    private String username;

    /**
     * Current (old) password is only required when changing password.
     * Must match the stored hash before a new password is accepted.
     */
    private String oldPassword;

    /** New password to set, only applied when oldPassword is also supplied. */
    private String newPassword;

    /** Confirmation of the new password must equal newPassword. */
    private String confirmNewPassword;
}
