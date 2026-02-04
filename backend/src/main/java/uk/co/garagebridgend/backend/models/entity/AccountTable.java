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
 *
 * Stores the basic profile and authentication data for a user account.
 * Keep sensitive values (passwords, PINs) hashed and salted.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountTable {

    /** Named constant for salt-related column lengths. */
    private static final int SALT_LENGTH = 16;

    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    /** Required: user's first name. */
    @Column(name = "first_name", nullable = false)
    private String firstName;

    /** Required: user's last name. */
    @Column(name = "last_name", nullable = false)
    private String lastName;

    /**
     * User's email address. Required and unique — used for sign-in and
     * notifications.
     */
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    /** Hashed password. Do not store plaintext passwords. */
    @Column(name = "password", nullable = false)
    private String password;

    /** Salt for the password hash (stored alongside the hash). */
    @Column(name = "salt", length = SALT_LENGTH, nullable = false)
    private String salt;

    /** Optional two-factor authentication (TOTP) secret. */
    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    /** Optional mobile PIN (should be hashed). */
    @Column(name = "mobile_pin")
    private String mobilePin;

    /** Salt used for hashing the mobile PIN. */
    @Column(name = "mobile_pin_salt", length = SALT_LENGTH)
    private String mobilePinSalt;

    /** Autopopulated creation timestamp (set once, not updatable). */
    @Column(name = "created", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime created;
}
