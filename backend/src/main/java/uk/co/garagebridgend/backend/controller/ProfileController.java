package uk.co.garagebridgend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import uk.co.garagebridgend.backend.logic.ProfileService;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;

@RestController
public class ProfileController {

    private final ProfileService profileService;

    @Autowired
    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile/me")
    public ProfileResponse getCurrentUser() {
        return profileService.getCurrentProfile();
    }
}
