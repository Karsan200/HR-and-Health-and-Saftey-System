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

    private final SettingsRepository settingsRepository;
    private final ThemeRepository themeRepository;
    private final AccountRepository accountRepository;

    /**
     * Helper method to get the currently authenticated account.
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
     */
    public SettingsResponse getAllSettings() {

        AccountTable account = getCurrentAccount();

        SettingsTable settings = settingsRepository.findByAccountId(account.getAccountId())
                .orElseThrow(() -> new RuntimeException("Settings not found"));

        ThemesTable theme = themeRepository.findByAccountId(account.getAccountId())
                .orElseThrow(() -> new RuntimeException("Theme not found"));

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

        return response;
    }

    /**
     * Updates all settings and theme data for the current user.
     */
    public void updateAllSettings(SettingsResponse request) {

        AccountTable account = getCurrentAccount();

        SettingsTable settings = settingsRepository.findByAccountId(account.getAccountId())
                .orElseThrow(() -> new RuntimeException("Settings not found"));

        ThemesTable theme = themeRepository.findByAccountId(account.getAccountId())
                .orElseThrow(() -> new RuntimeException("Theme not found"));

        // Update Accessibility Settings
        settings.setLargeText(request.isLargeText());
        settings.setDyslexicFont(request.isDyslexicFont());
        settings.setHighlightText(request.isHighlightText());
        settings.setTextToSpeech(request.isTextToSpeech());
        settings.setDictation(request.isDictation());

        // Update Silent Mode
        settings.setSilentStart(request.getSilentStart());
        settings.setSilentEnd(request.getSilentEnd());

        // Update Theme
        theme.setThemePreset(request.getThemePreset());
        theme.setAccentColour(request.getAccentColour());
        theme.setBackgroundColour(request.getBackgroundColour());
        theme.setTextColour(request.getTextColour());

        settingsRepository.save(settings);
        themeRepository.save(theme);
    }
}
