package uk.co.garagebridgend.backend.logic;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
public class ProfileServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private ProfileService profileService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetCurrentProfileSuccess() {
        // Arrange
        AccountTable account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");
        account.setEmail("john.doe@example.com");
        account.setPhoneNumber("1234567890");
        account.setCreated(LocalDateTime.of(2026, 3, 18, 10, 0));

        when(accountRepository.findById(123L)).thenReturn(Optional.of(account));
        when(authenticationService.getCurrentUser()).thenReturn(account);

        // Act
        ProfileResponse response = profileService.getCurrentProfile();

        // Assert
        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("john.doe@example.com", response.getEmail());
        assertEquals("1234567890", response.getPhoneNumber());
        assertFalse(response.isHasPinCode());
        assertEquals("18 March 2026", response.getCreated());
    }

    @Test
    void testGetCurrentProfileAccountNotFound() {
        // Arrange
        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        // Act & Assert
        AuthenticatedAccountNotFoundException exception =
                assertThrows(AuthenticatedAccountNotFoundException.class, () -> {
                    profileService.getCurrentProfile();
                });

        assertEquals("Account not found.", exception.getMessage());
    }
}
