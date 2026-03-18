package uk.co.garagebridgend.backend.logic;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;

import java.time.format.DateTimeFormatter;

@Service
public class ProfileService {

    private final AccountRepository accountRepository;

    @Autowired
    public ProfileService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public ProfileResponse getCurrentProfile()
            throws AuthenticatedAccountNotFoundException, NotFoundException {

        User user = AuthenticationService.getCurrentUser();

        if (user == null) {
            throw new AuthenticatedAccountNotFoundException();
        }

        Long accountId = Long.valueOf(user.getUsername());

        AccountTable account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Account failed to load"));


        return new ProfileResponse(
                account.getFirstName(),
                account.getLastName(),
                account.getEmail(),
                account.getPhoneNumber(),
                account.getCreated().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"))
        );
    }
}
