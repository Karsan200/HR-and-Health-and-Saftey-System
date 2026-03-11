package uk.co.garagebridgend.backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    @BeforeEach
    void setup() {
        AccountTable account = new AccountTable();

        // Set account values for testing
        account.setFirstName("John");
        account.setLastName("Doe");
        account.setUsername("johnd18");
        account.setEmail("johnd@test.com");
        account.setPassword("hashedPassword");
        account.setAddressOne("123 Main St");
        account.setPostalCode("12345");

        // Save the account to the repository
        accountRepository.save(account);
    }

    @Test
    void shouldFindAccountByUsername() {
        Optional<AccountTable> found =
                accountRepository.findByUsername("johnd18");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail())
                .isEqualTo("johnd@test.com");
    }

    @Test
    void shouldReturnEmptyWhenUsernameNotFound() {

        Optional<AccountTable> found =
                accountRepository.findByUsername("doesnotexist");

        assertThat(found).isEmpty();
    }
}