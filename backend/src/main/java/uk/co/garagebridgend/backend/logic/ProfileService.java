package uk.co.garagebridgend.backend.logic;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;

import java.time.format.DateTimeFormatter;

/**
 * Service responsible for retrieving the profile information for the currently authenticated user.
 */
@Service
public class ProfileService {

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /**
     * Constructor for dependency injection of required repositories.
     *
     * @param authenticationServiceImpl the AuthenticationService implementation to use
     */
    @Autowired
    public ProfileService(
            final AuthenticationService authenticationServiceImpl) {
        this.authenticationService = authenticationServiceImpl;
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
}
