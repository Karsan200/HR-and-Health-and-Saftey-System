package uk.co.garagebridgend.backend.logic;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UpdateProfileRequest;
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

    /** Reusable account with all fields set for update tests. */
    private AccountTable account;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");
        account.setEmail("john.doe@example.com");
        account.setPhoneNumber("1234567890");
        account.setUsername("johndoe");
        account.setPassword(BCrypt.hashpw("oldpass123", BCrypt.gensalt()));
        account.setCreated(LocalDateTime.of(2026, 3, 18, 10, 0));
    }

    // getCurrentProfile

    @Test
    void testGetCurrentProfileSuccess() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        ProfileResponse response = profileService.getCurrentProfile();

        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertEquals("Doe",  response.getLastName());
        assertEquals("john.doe@example.com", response.getEmail());
        assertEquals("1234567890", response.getPhoneNumber());
        assertFalse(response.isHasPinCode());
        assertEquals("18 March 2026", response.getCreated());
    }

    @Test
    void testGetCurrentProfileHasPinCode() throws AuthenticatedAccountNotFoundException {
        account.setMobilePin("1234");
        when(authenticationService.getCurrentUser()).thenReturn(account);

        ProfileResponse response = profileService.getCurrentProfile();

        assertTrue(response.isHasPinCode());
    }

    @Test
    void testGetCurrentProfileAccountNotFound() {
        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(AuthenticatedAccountNotFoundException.class,
                () -> profileService.getCurrentProfile());
    }

    // updateProfile, contact

    @Test
    void testUpdateProfileEmailSuccess() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("new.email@example.com");

        profileService.updateProfile(request);

        assertEquals("new.email@example.com", account.getEmail());
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateProfileEmailBlankIsIgnored() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("   ");

        profileService.updateProfile(request);

        // Original email must be unchanged
        assertEquals("john.doe@example.com", account.getEmail());
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateProfilePhoneSuccess() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setPhoneNumber("07700900000");

        profileService.updateProfile(request);

        assertEquals("07700900000", account.getPhoneNumber());
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateProfilePhoneBlankIsIgnored() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setPhoneNumber("");

        profileService.updateProfile(request);

        assertEquals("1234567890", account.getPhoneNumber());
        verify(accountRepository).save(account);
    }

    // updateProfile, username

    @Test
    void testUpdateProfileUsernameSuccess() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);
        // No existing account owns the new username
        when(accountRepository.findByUsername("newusername")).thenReturn(Optional.empty());

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("newusername");

        profileService.updateProfile(request);

        assertEquals("newusername", account.getUsername());
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateProfileUsernameBlankIsIgnored() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("  ");

        profileService.updateProfile(request);

        assertEquals("johndoe", account.getUsername());
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateProfileUsernameTakenByOtherAccount() throws AuthenticatedAccountNotFoundException {
        AccountTable otherAccount = new AccountTable();
        otherAccount.setAccountId(99L);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(accountRepository.findByUsername("takenname")).thenReturn(Optional.of(otherAccount));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("takenname");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals("Username is already taken", ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testUpdateProfileUsernameMatchesOwnAccount() throws AuthenticatedAccountNotFoundException {
        // Same account ID, should be allowed
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(accountRepository.findByUsername("johndoe")).thenReturn(Optional.of(account));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setUsername("johndoe");

        profileService.updateProfile(request);

        assertEquals("johndoe", account.getUsername());
        verify(accountRepository).save(account);
    }

    // updateProfile, password change

    @Test
    void testUpdateProfilePasswordSuccess() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("oldpass123");
        request.setNewPassword("newpass456");
        request.setConfirmNewPassword("newpass456");

        profileService.updateProfile(request);

        assertTrue(BCrypt.checkpw("newpass456", account.getPassword()));
        verify(accountRepository).save(account);
    }

    @Test
    void testUpdateProfilePasswordMissingOldPassword() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setNewPassword("newpass456");
        request.setConfirmNewPassword("newpass456");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals(
                "Old password, new password, and confirmation are all required to change your password",
                ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testUpdateProfilePasswordMissingNewPassword() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("oldpass123");
        request.setConfirmNewPassword("newpass456");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals(
                "Old password, new password, and confirmation are all required to change your password",
                ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testUpdateProfilePasswordMissingConfirmPassword() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("oldpass123");
        request.setNewPassword("newpass456");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals(
                "Old password, new password, and confirmation are all required to change your password",
                ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testUpdateProfilePasswordIncorrectOldPassword() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("wrongpass");
        request.setNewPassword("newpass456");
        request.setConfirmNewPassword("newpass456");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals("Current password is incorrect", ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testUpdateProfilePasswordConfirmationMismatch() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("oldpass123");
        request.setNewPassword("newpass456");
        request.setConfirmNewPassword("differentpass");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals("New password and confirmation do not match", ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    @Test
    void testUpdateProfilePasswordTooShort() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("oldpass123");
        request.setNewPassword("short");
        request.setConfirmNewPassword("short");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> profileService.updateProfile(request));

        assertEquals("New password must be at least 8 characters", ex.getMessage());
        verify(accountRepository, never()).save(any());
    }

    // updateProfile, account not found

    @Test
    void testUpdateProfileAccountNotFound() {
        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("any@example.com");

        assertThrows(AuthenticatedAccountNotFoundException.class,
                () -> profileService.updateProfile(request));

        verify(accountRepository, never()).save(any());
    }

    // updateProfile, no fields filled

    @Test
    void testUpdateProfileNoFieldsStillSaves() throws AuthenticatedAccountNotFoundException {
        when(authenticationService.getCurrentUser()).thenReturn(account);

        // Empty request so nothing to change but save is still called
        profileService.updateProfile(new UpdateProfileRequest());

        verify(accountRepository).save(account);
    }
}