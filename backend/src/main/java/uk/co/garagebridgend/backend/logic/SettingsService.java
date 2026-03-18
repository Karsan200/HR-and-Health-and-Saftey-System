package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.response.SettingsResponse;
import uk.co.garagebridgend.backend.models.entity.SettingsTable;
import uk.co.garagebridgend.backend.models.entity.ThemesTable;
import uk.co.garagebridgend.backend.repository.SettingsRepository;
import uk.co.garagebridgend.backend.repository.ThemeRepository;

/**
 * Service responsible for handling business logic related to user settings
 * and theme preferences.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SettingsService {

    /**
     * Repository used to access settings data from the database.
     */
    private final SettingsRepository settingsRepository;

    /**
     * Repository used to access theme data from the database.
     */
    private final ThemeRepository themeRepository;

    /**
     * Retrieves all settings and theme data for a given account.
     *
     * @param accountId the ID of the user
     * @return combined settings + theme response
     */
    public SettingsResponse getAllSettings(Long accountId) {

        SettingsTable settings = settingsRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Settings not found"));

        ThemesTable theme = themeRepository.findByAccountId(accountId)
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
     * Updates all settings and theme data for a given account.
     *
     * @param accountId the ID of the user
     * @param request the updated settings and theme values
     */
    public void updateAllSettings(Long accountId, SettingsResponse request) {

        SettingsTable settings = settingsRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Settings not found"));

        ThemesTable theme = themeRepository.findByAccountId(accountId)
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

        // Save both
        settingsRepository.save(settings);
        themeRepository.save(theme);
    }
}
