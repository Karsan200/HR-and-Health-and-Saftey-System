package uk.co.garagebridgend.backend.models.response;


import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response payload sent when user is loading their account page
 * with a valid authenticated account
 */
@Data
@AllArgsConstructor
public class ProfileResponse {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String created;
}
