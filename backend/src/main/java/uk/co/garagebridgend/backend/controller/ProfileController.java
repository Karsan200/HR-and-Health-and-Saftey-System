package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.ProfileService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;

/**
 * REST controller exposing endpoints related to user profile operations.
 * Provides access to the currently authenticated user's profile information.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    /** Service responsible for fetching profile data. */
    private final ProfileService profileService;


    /**
     * Endpoint to retrieve the currently authenticated user's profile information.
     * Maps to GET /profile/me.
     *
     * @return a {@link ProfileResponse} containing the user's data for profile page
     */
    @GetMapping("/me")
    public ProfileResponse getCurrentUser() {
        try {
            return profileService.getCurrentProfile();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token"
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"
            );
        }
    }
}
