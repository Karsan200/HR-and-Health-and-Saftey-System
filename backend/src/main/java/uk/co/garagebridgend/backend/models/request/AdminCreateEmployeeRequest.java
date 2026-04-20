package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for creating a new employee from the admin employee overview page.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminCreateEmployeeRequest {

    /** Employee first name. */
    private String firstName;

    /** Employee surname. */
    private String surname;

    /** Employee email address. */
    private String email;

    /** Employee phone number. */
    private String phoneNumber;

    /** Address line one. */
    private String addressOne;

    /** Optional address line two. */
    private String addressTwo;

    /** Postal code. */
    private String postalCode;

    /** Employee's position. */
    private String position;

    /** Username for the new account. */
    private String username;

    /** Account password to be hashed. */
    private String password;
}
