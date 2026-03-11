package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Account entity mapped to the database.
 * <p>
 * Stores the basic profile and authentication data for a user account.
 * Keep sensitive values (passwords, PINs) hashed and salted.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountTable {

    /** Named constant for phone number column length. */
    private static final int PHONE_NUMBER_LENGTH = 17;

    /** Named constant for region code column length. */
    private static final int REGION_CODE_LENGTH = 4;

    /** Named constant for postal code column length. */
    private static final int POSTAL_CODE_LENGTH = 8;

    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    /** Required: user's first name. */
    @Column(columnDefinition = "TEXT", name = "first_name", nullable = false)
    private String firstName;

    /** Required: user's last name. */
    @Column(columnDefinition = "TEXT", name = "last_name", nullable = false)
    private String lastName;

    /** Required: user's username. - used for sign-in */
    @Column(columnDefinition = "TEXT", name = "username", nullable = false, unique = true)
    private String username;

    /**
     * User's email address. Required and unique — used for admin and
     * notifications.
     */
    @Column(columnDefinition = "TEXT", name = "email", nullable = false)
    private String email;

    /** Hashed password. Do not store plaintext passwords. */
    @Column(columnDefinition = "TEXT", name = "password", nullable = false)
    private String password;

    /** Region code for phone number. */
    @Column(name = "region_code", length = REGION_CODE_LENGTH)
    private String regionCode;

    /** Phone number. */
    @Column(name = "phone_number", length = PHONE_NUMBER_LENGTH)
    private String phoneNumber;

    /** Address line one. */
    @Column(columnDefinition = "TEXT", name = "address_one", nullable = false)
    private String addressOne;

    /** Address line two. */
    @Column(columnDefinition = "TEXT", name = "address_two")
    private String addressTwo;

    /** Postal code. */
    @Column(name = "postal_code", length = POSTAL_CODE_LENGTH, nullable = false)
    private String postalCode;

    /** Optional two-factor authentication (TOTP) secret. */
    @Column(columnDefinition = "TEXT", name = "two_factor_secret")
    private String twoFactorSecret;

    /** Optional mobile PIN (should be hashed). */
    @Column(columnDefinition = "TEXT", name = "mobile_pin")
    private String mobilePin;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
