package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.co.garagebridgend.backend.logic.SettingsService;
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
     * @param accountId the ID of the user
     * @return combined settings + theme response
     */
    @GetMapping("/{accountId}")
    public ResponseEntity<SettingsResponse> getSettings(@PathVariable Long accountId) {

        SettingsResponse response = settingsService.getAllSettings(accountId);

        return ResponseEntity.ok(response);
    }

    /**
     * Updates all settings and theme data for a given account.
     *
     * @param accountId the ID of the user
     * @param request the updated settings and theme values
     * @return success response
     */
    @PutMapping("/{accountId}")
    public ResponseEntity<Void> updateSettings(
            @PathVariable Long accountId,
            @RequestBody SettingsResponse request
    ) {

        settingsService.updateAllSettings(accountId, request);

        return ResponseEntity.noContent().build();
    }
}