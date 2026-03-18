package uk.co.garagebridgend.backend.models.response;


import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response payload sent when user is loading their account page
 * with a valid authenticated account.
 */
@Data
@AllArgsConstructor
public class ProfileResponse {
    /**
     * First name of user.
     */
    private String firstName;
    /**
     * Last name of user.
     */
    private String lastName;
    /**
     * Users email address.
     */
    private String email;
    /**
     * Users phone number.
     */
    private String phoneNumber;

    /**
     * Whether the user has a pin code set up for mobile app authentication.
     */
    private boolean hasPinCode;
    /**
     * Date user was added to database.
     */
    private String created;
}
