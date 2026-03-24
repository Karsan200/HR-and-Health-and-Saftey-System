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

//    @GetMapping
//    public String test() {
//        return "Settings endpoint is working!";
//    }

    /**
     * Retrieves all settings and theme data for a given account.
     *
     * @return combined settings + theme response
     */
    @GetMapping
    public ResponseEntity<SettingsResponse> getSettings() {

        SettingsResponse response = settingsService.getAllSettings();

        return ResponseEntity.ok(response);
    }

    /**
     * Updates all settings and theme data for a given account.
     *
     * @param request the updated settings and theme values
     * @return success response
     */
    @PutMapping
    public ResponseEntity<Void> updateSettings(
            @RequestBody SettingsResponse request
    ) {

        settingsService.updateAllSettings(request);

        return ResponseEntity.noContent().build();
    }
}