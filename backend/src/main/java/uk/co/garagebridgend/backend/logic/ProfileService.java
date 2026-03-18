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

    /** Repository for fetching account data. */
    private final AccountRepository accountRepository;

    /**
     * Constructor for dependency injection of required repositories.
     *
     * @param repository the AccountRepository implementation to use
     */
    @Autowired
    public ProfileService(final AccountRepository repository) {
        this.accountRepository = repository;
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
        User user = AuthenticationService.getCurrentUser();

        // throws exception if no user is authenticated
        if (user == null) {
            throw new AuthenticatedAccountNotFoundException();
        }

        Long accountId = Long.valueOf(user.getUsername());

        // Fetch the account from the database or throw an exception if not found
        AccountTable account = accountRepository.findById(accountId)
                .orElseThrow(AuthenticatedAccountNotFoundException::new);


        // Return a ProfileResponse containing the relevant account information for profile page
        return new ProfileResponse(
                account.getFirstName(),
                account.getLastName(),
                account.getEmail(),
                account.getPhoneNumber(),
                account.getCreated().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
        );
    }
}
