package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.SettingsService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.SettingsResponse;

/**
 * REST controller for handling user settings and theme preferences.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    /**
     * Service layer for handling settings logic.
     */
    private final SettingsService settingsService;
    /**
     * Retrieves all settings and theme data for a given account.
     *
     * @return combined settings + theme response
     */
    @GetMapping
    public SettingsResponse getSettings() {
        try {
            return settingsService.getAllSettings();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    /**
     * Updates all settings and theme data for a given account.
     *
     * @param request the updated settings and theme values
     */
    @PutMapping
    public void updateSettings(final @RequestBody SettingsResponse request) {
        try {
            settingsService.updateAllSettings(request);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}
