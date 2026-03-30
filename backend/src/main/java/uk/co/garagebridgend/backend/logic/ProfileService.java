package uk.co.garagebridgend.backend.logic;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UpdateProfileRequest;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;

import java.time.format.DateTimeFormatter;

/**
 * Service responsible for retrieving and updating the profile information
 * for the currently authenticated user.
 */
@Service
public class ProfileService {

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /** Repository for persisting account changes. */
    private final AccountRepository accountRepository;

    /** Encoder used to hash and verify passwords. */
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructor for dependency injection of required repositories.
     *
     * @param authenticationServiceImpl the AuthenticationService implementation to use
     */
    @Autowired
    public ProfileService(
            final AuthenticationService authenticationServiceImpl,
            final AccountRepository accountRepository,
            final PasswordEncoder passwordEncoder) {
        this.authenticationService = authenticationServiceImpl;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Retrieves the profile information of the currently authenticated user.
     * This includes first name, last name, email, phone number, and account creation date.
     *
     * @return a {@link ProfileResponse} containing the user's profile information
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found in the security context
     */
    public ProfileResponse getCurrentProfile()
            throws AuthenticatedAccountNotFoundException {

        // Get currently authenticated user via authentication service
        var account = authenticationService.getCurrentUser();

        // Return a ProfileResponse containing the relevant account information for profile page
        return new ProfileResponse(
                account.getFirstName(),
                account.getLastName(),
                account.getEmail(),
                account.getPhoneNumber(),
                account.getMobilePin() != null,
                account.getCreated().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
        );
    }

    /**
     * Updates the currently authenticated user's profile with the provided fields.
     * Only non-null fields in the request are applied.
     * Password change requires a matching oldPassword and equal newPassword/confirmNewPassword.
     *
     * @param request the {@link UpdateProfileRequest} containing fields to update
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found
     * @throws IllegalArgumentException if password validation fails or username is taken
     */
    public void updateProfile(final UpdateProfileRequest request)
            throws AuthenticatedAccountNotFoundException {

        var account = authenticationService.getCurrentUser();

        // Email
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            account.setEmail(request.getEmail().trim());
        }

        // Phone number
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            account.setPhoneNumber(request.getPhoneNumber().trim());
        }

        // Username
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();

            // Reject if another account already owns this username
            accountRepository.findByUsername(newUsername)
                    .filter(existing -> !existing.getAccountId().equals(account.getAccountId()))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Username is already taken");
                    });

            account.setUsername(newUsername);
        }

        // Password change
        boolean hasOld     = request.getOldPassword()     != null && !request.getOldPassword().isBlank();
        boolean hasNew     = request.getNewPassword()     != null && !request.getNewPassword().isBlank();
        boolean hasConfirm = request.getConfirmNewPassword() != null && !request.getConfirmNewPassword().isBlank();

        if (hasOld || hasNew || hasConfirm) {
            // All three fields are required together
            if (!hasOld || !hasNew || !hasConfirm) {
                throw new IllegalArgumentException(
                        "Old password, new password, and confirmation are all required to change your password");
            }

            // Verify the current password is correct
            if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }

            // New password and confirmation must match
            if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
                throw new IllegalArgumentException("New password and confirmation do not match");
            }

            // Minimum length check (8 characters)
            if (request.getNewPassword().length() < 8) {
                throw new IllegalArgumentException("New password must be at least 8 characters");
            }

            account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        accountRepository.save(account);
    }
}