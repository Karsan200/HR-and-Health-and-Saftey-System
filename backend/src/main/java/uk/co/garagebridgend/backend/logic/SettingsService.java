package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.SettingsResponse;
import uk.co.garagebridgend.backend.models.entity.SettingsTable;
import uk.co.garagebridgend.backend.models.entity.ThemesTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.repository.SettingsRepository;
import uk.co.garagebridgend.backend.repository.ThemeRepository;
import uk.co.garagebridgend.backend.repository.AccountRepository;

/**
 * Service responsible for handling business logic related to user settings
 * and theme preferences.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SettingsService {

    /** Repository for fetching account settings. */
    private final SettingsRepository settingsRepository;

    /** Repository for fetching account theme visuals. */
    private final ThemeRepository themeRepository;

    /** Repository for fetching account data related to session creation and validation. */
    private final AccountRepository accountRepository;

    /**
     * Helper method to get the currently authenticated account.
     * @return account found by ID.
     */
    private AccountTable getCurrentAccount() {
        var user = AuthenticationService.getCurrentUser();

        if (user == null) {
            throw new AuthenticatedAccountNotFoundException();
        }

        return accountRepository.findById(Long.valueOf(user.getUsername()))
                .orElseThrow(AuthenticatedAccountNotFoundException::new);
    }

    /**
     * Retrieves all settings and theme data for the current user.
     * @return all settings for user as an object.
     */
    public SettingsResponse getAllSettings() {

        System.out.println("Step 1: Entered getAllSettings()");

        AccountTable account = getCurrentAccount();
        System.out.println("Step 2: Retrieved current account with ID: " + account.getAccountId());

        // Get or create settings
        SettingsTable settings = settingsRepository
                .findByAccountId(account.getAccountId())
                .orElseGet(() -> {
                    System.out.println("Step 3: No settings found for account, creating default settings");
                    SettingsTable s = new SettingsTable();
                    s.setAccount(account);

                    // Optional defaults
                    s.setLargeText(false);
                    s.setDyslexicFont(false);
                    s.setHighlightText(false);
                    s.setTextToSpeech(false);
                    s.setDictation(false);

                    return settingsRepository.save(s);
                });

        // Get or create theme
        ThemesTable theme = themeRepository
                .findByAccountId(account.getAccountId())
                .orElseGet(() -> {
                    System.out.println("Step 4: No theme found for account, creating default theme");
                    ThemesTable t = new ThemesTable();
                    t.setAccount(account);

                    // Optional defaults
                    t.setThemePreset("DEFAULT");
                    t.setAccentColour("#D20414");
                    t.setBackgroundColour("#F6F6F8");
                    t.setTextColour("#000000");

                    return themeRepository.save(t);
                });

        System.out.println("Step 5: Retrieved settings and theme, preparing response");
        SettingsResponse response = new SettingsResponse();

        // Accessibility Settings
        response.setLargeText(settings.isLargeText());
        response.setDyslexicFont(settings.isDyslexicFont());
        response.setHighlightText(settings.isHighlightText());
        response.setTextToSpeech(settings.isTextToSpeech());
        response.setDictation(settings.isDictation());

        // Silent Mode
        response.setSilentStart(settings.getSilentStart());
        response.setSilentEnd(settings.getSilentEnd());

        // Theme
        response.setThemePreset(theme.getThemePreset());
        response.setAccentColour(theme.getAccentColour());
        response.setBackgroundColour(theme.getBackgroundColour());
        response.setTextColour(theme.getTextColour());

        System.out.println("Step 6: Prepared response: " + response);

        return response;
    }

    /**
     * Updates all settings and theme data for the current user.
     * @param request the settings response.
     */
    public void updateAllSettings(final SettingsResponse request) {

        AccountTable account = getCurrentAccount();

        SettingsTable settings = settingsRepository
                .findByAccountId(account.getAccountId())
                .orElseGet(() -> {
                    SettingsTable s = new SettingsTable();
                    s.setAccount(account);
                    return settingsRepository.save(s);
                });

        ThemesTable theme = themeRepository
                .findByAccountId(account.getAccountId())
                .orElseGet(() -> {
                    ThemesTable t = new ThemesTable();
                    t.setAccount(account);
                    return themeRepository.save(t);
                });

        if (request.getLargeText() != null) {
            settings.setLargeText(request.getLargeText());
        }

        if (request.getDyslexicFont() != null) {
            settings.setDyslexicFont(request.getDyslexicFont());
        }

        if (request.getHighlightText() != null) {
            settings.setHighlightText(request.getHighlightText());
        }

        if (request.getTextToSpeech() != null) {
            settings.setTextToSpeech(request.getTextToSpeech());
        }

        if (request.getDictation() != null) {
            settings.setDictation(request.getDictation());
        }

        if (request.getSilentStart() != null) {
            settings.setSilentStart(request.getSilentStart());
        }

        if (request.getSilentEnd() != null) {
            settings.setSilentEnd(request.getSilentEnd());
        }

        if (request.getThemePreset() != null) {
            theme.setThemePreset(request.getThemePreset());
        } else {
            theme.setThemePreset(null);
        }

        if (request.getAccentColour() != null) {
            theme.setAccentColour(request.getAccentColour());
        }

        if (request.getBackgroundColour() != null) {
            theme.setBackgroundColour(request.getBackgroundColour());
        }

        if (request.getTextColour() != null) {
            theme.setTextColour(request.getTextColour());
        }


        settingsRepository.save(settings);
        themeRepository.save(theme);
    }
}
