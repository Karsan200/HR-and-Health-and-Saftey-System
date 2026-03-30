package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.ProfileService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UpdateProfileRequest;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;

/**
 * REST controller exposing endpoints related to user profile operations.
 * Provides access to the currently authenticated user's profile information.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    /** Service responsible for fetching and updating profile data. */
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
                    HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    /**
     * Updates the currently authenticated user's profile.
     * Maps to PUT /api/profile/me.
     * Only non-blank fields in the request body are applied.
     *
     * @param request the {@link UpdateProfileRequest} with fields to update
     */
    @PutMapping("/me")
    public void updateCurrentUser(@RequestBody final UpdateProfileRequest request) {
        try {
            profileService.updateProfile(request);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        } catch (IllegalArgumentException e) {
            // Validation failures (wrong password, username taken, etc.)
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}
