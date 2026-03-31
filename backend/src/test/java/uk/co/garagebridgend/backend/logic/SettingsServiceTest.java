package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.SettingsTable;
import uk.co.garagebridgend.backend.models.entity.ThemesTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.SettingsResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.SettingsRepository;
import uk.co.garagebridgend.backend.repository.ThemeRepository;

import java.sql.Time;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for {@link SettingsService}.
 */
@ActiveProfiles("test")
@Transactional
public class SettingsServiceTest {

    @Mock
    private SettingsRepository settingsRepository;

    @Mock
    private ThemeRepository themeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private SettingsService settingsService;

    private AccountTable mockAccount;
    private SettingsTable mockSettings;
    private ThemesTable mockTheme;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        mockAccount = new AccountTable();
        mockAccount.setAccountId(1L);
        mockAccount.setFirstName("John");
        mockAccount.setLastName("Doe");

        mockSettings = new SettingsTable();
        mockSettings.setAccount(mockAccount);
        mockSettings.setLargeText(true);
        mockSettings.setDyslexicFont(false);
        mockSettings.setHighlightText(true);
        mockSettings.setTextToSpeech(false);
        mockSettings.setDictation(true);
        mockSettings.setSilentStart(Time.valueOf("22:00:00"));
        mockSettings.setSilentEnd(Time.valueOf("07:00:00"));

        mockTheme = new ThemesTable();
        mockTheme.setAccount(mockAccount);
        mockTheme.setThemePreset("DEFAULT");
        mockTheme.setAccentColour("#D20414");
        mockTheme.setBackgroundColour("#F6F6F8");
        mockTheme.setTextColour("#000000");
    }

    // -------------------------------------------------------------------------
    // getAllSettings()
    // -------------------------------------------------------------------------

    @Test
    void testGetAllSettingsSuccess() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.of(mockSettings));
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.of(mockTheme));

        SettingsResponse result = settingsService.getAllSettings();

        assertNotNull(result);
        assertTrue(result.getLargeText());
        assertFalse(result.getDyslexicFont());
        assertTrue(result.getHighlightText());
        assertFalse(result.getTextToSpeech());
        assertTrue(result.getDictation());
        assertEquals(Time.valueOf("22:00:00"), result.getSilentStart());
        assertEquals(Time.valueOf("07:00:00"), result.getSilentEnd());
        assertEquals("DEFAULT", result.getThemePreset());
        assertEquals("#D20414", result.getAccentColour());
        assertEquals("#F6F6F8", result.getBackgroundColour());
        assertEquals("#000000", result.getTextColour());
    }

    @Test
    void testGetAllSettingsCreatesDefaultSettingsWhenNoneExist() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.empty());
        when(settingsRepository.save(any(SettingsTable.class))).thenReturn(mockSettings);
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.of(mockTheme));

        SettingsResponse result = settingsService.getAllSettings();

        assertNotNull(result);
        verify(settingsRepository, times(1)).save(any(SettingsTable.class));
    }

    @Test
    void testGetAllSettingsCreatesDefaultThemeWhenNoneExist() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.of(mockSettings));
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.empty());
        when(themeRepository.save(any(ThemesTable.class))).thenReturn(mockTheme);

        SettingsResponse result = settingsService.getAllSettings();

        assertNotNull(result);
        verify(themeRepository, times(1)).save(any(ThemesTable.class));
    }

    @Test
    void testGetAllSettingsThrowsWhenUserIsNull() {
        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(AuthenticatedAccountNotFoundException.class,
                () -> settingsService.getAllSettings());
    }

    @Test
    void testGetAllSettingsThrowsWhenAccountNotFound() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(AuthenticatedAccountNotFoundException.class,
                () -> settingsService.getAllSettings());
    }

    // -------------------------------------------------------------------------
    // updateAllSettings()
    // -------------------------------------------------------------------------

    @Test
    void testUpdateAllSettingsSuccess() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.of(mockSettings));
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.of(mockTheme));

        SettingsResponse request = new SettingsResponse();
        request.setLargeText(false);
        request.setDyslexicFont(true);
        request.setHighlightText(false);
        request.setTextToSpeech(true);
        request.setDictation(false);
        request.setSilentStart(Time.valueOf("23:00:00"));
        request.setSilentEnd(Time.valueOf("06:00:00"));
        request.setThemePreset("DARK");
        request.setAccentColour("#FFFFFF");
        request.setBackgroundColour("#000000");
        request.setTextColour("#CCCCCC");

        settingsService.updateAllSettings(request);

        verify(settingsRepository, times(1)).save(mockSettings);
        verify(themeRepository, times(1)).save(mockTheme);

        assertFalse(mockSettings.isLargeText());
        assertTrue(mockSettings.isDyslexicFont());
        assertFalse(mockSettings.isHighlightText());
        assertTrue(mockSettings.isTextToSpeech());
        assertFalse(mockSettings.isDictation());
        assertEquals(Time.valueOf("23:00:00"), mockSettings.getSilentStart());
        assertEquals(Time.valueOf("06:00:00"), mockSettings.getSilentEnd());
        assertEquals("DARK", mockTheme.getThemePreset());
        assertEquals("#FFFFFF", mockTheme.getAccentColour());
        assertEquals("#000000", mockTheme.getBackgroundColour());
        assertEquals("#CCCCCC", mockTheme.getTextColour());
    }

    @Test
    void testUpdateAllSettingsNullFieldsAreIgnored() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.of(mockSettings));
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.of(mockTheme));

        // Only set one field, leave the rest null
        SettingsResponse request = new SettingsResponse();
        request.setAccentColour("#123456");

        settingsService.updateAllSettings(request);

        // Unchanged fields should retain original values
        assertTrue(mockSettings.isLargeText());
        assertFalse(mockSettings.isDyslexicFont());
        assertEquals("#123456", mockTheme.getAccentColour());
        assertEquals("#F6F6F8", mockTheme.getBackgroundColour());
    }

    @Test
    void testUpdateAllSettingsNullThemePresetSetsNull() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.of(mockSettings));
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.of(mockTheme));

        // ThemePreset is explicitly null — service should set it to null
        SettingsResponse request = new SettingsResponse();
        request.setThemePreset(null);

        settingsService.updateAllSettings(request);

        assertNull(mockTheme.getThemePreset());
    }

    @Test
    void testUpdateAllSettingsCreatesDefaultSettingsWhenNoneExist() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.empty());
        when(settingsRepository.save(any(SettingsTable.class))).thenReturn(mockSettings);
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.of(mockTheme));

        settingsService.updateAllSettings(new SettingsResponse());

        verify(settingsRepository, atLeast(1)).save(any(SettingsTable.class));
    }

    @Test
    void testUpdateAllSettingsCreatesDefaultThemeWhenNoneExist() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(mockAccount));
        when(settingsRepository.findByAccountId(1L)).thenReturn(Optional.of(mockSettings));
        when(themeRepository.findByAccountId(1L)).thenReturn(Optional.empty());
        when(themeRepository.save(any(ThemesTable.class))).thenReturn(mockTheme);

        settingsService.updateAllSettings(new SettingsResponse());

        verify(themeRepository, atLeast(1)).save(any(ThemesTable.class));
    }

    @Test
    void testUpdateAllSettingsThrowsWhenUserIsNull() {
        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(AuthenticatedAccountNotFoundException.class,
                () -> settingsService.updateAllSettings(new SettingsResponse()));
    }

    @Test
    void testUpdateAllSettingsThrowsWhenAccountNotFound() {
        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(AuthenticatedAccountNotFoundException.class,
                () -> settingsService.updateAllSettings(new SettingsResponse()));
    }
}