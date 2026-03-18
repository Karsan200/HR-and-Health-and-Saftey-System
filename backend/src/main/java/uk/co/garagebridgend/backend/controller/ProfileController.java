package uk.co.garagebridgend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import uk.co.garagebridgend.backend.logic.ProfileService;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;

/**
 * REST controller exposing endpoints related to user profile operations.
 * Provides access to the currently authenticated user's profile information.
 */
@RestController
public class ProfileController {

    /** Service responsible for fetching profile data. */
    private final ProfileService profileService;

    /**
     * Allows for dependency injection of the ProfileService.
     *
     * @param service the ProfileService implementation to use
     */
    @Autowired
    public ProfileController(final ProfileService service) {
        this.profileService = service;
    }


    /**
     * Endpoint to retrieve the currently authenticated user's profile information.
     * Maps to GET /profile/me.
     *
     * @return a {@link ProfileResponse} containing the user's data for profile page
     */
    @GetMapping("/profile/me")
    public ProfileResponse getCurrentUser() {
        return profileService.getCurrentProfile();
    }
}
