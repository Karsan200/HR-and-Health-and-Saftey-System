package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.SettingsService;

/**
 * REST controller exposing endpoints for retrieving users settings information.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    /** Service responsible for handling settings-related business logic. */
    private final SettingsService settingsService;

}
