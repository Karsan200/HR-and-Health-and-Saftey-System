package uk.co.garagebridgend.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.ProfileService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UpdateProfileRequest;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

/**
 * Controller tests for {@link ProfileController}.
 */
@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
public class ProfileControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private ProfileController profileController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(profileController).build();
    }

    // GET /api/profile/me

    @Test
    void testGetCurrentUserSuccess() throws Exception {
        ProfileResponse mockProfile = new ProfileResponse(
                "John",
                "Doe",
                "john.doe@example.com",
                "1234567890",
                false,
                "18 March 2026"
        );

        when(profileService.getCurrentProfile()).thenReturn(mockProfile);

        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName",   is("John")))
                .andExpect(jsonPath("$.lastName",    is("Doe")))
                .andExpect(jsonPath("$.email",       is("john.doe@example.com")))
                .andExpect(jsonPath("$.phoneNumber", is("1234567890")))
                .andExpect(jsonPath("$.hasPinCode",  is(false)))
                .andExpect(jsonPath("$.created",     is("18 March 2026")));
    }

    @Test
    void testGetCurrentUserUnauthorised() throws Exception {
        when(profileService.getCurrentProfile())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(status().reason("Invalid or expired refresh token"));
    }

    @Test
    void testGetCurrentUserInternalServerError() throws Exception {
        when(profileService.getCurrentProfile())
                .thenThrow(new RuntimeException("Something went wrong"));

        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isInternalServerError())
                .andExpect(status().reason("Internal server error"));
    }

    // PUT /api/profile/me

    @Test
    void testUpdateCurrentUserSuccess() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("new.email@example.com");
        request.setPhoneNumber("07700900000");

        doNothing().when(profileService).updateProfile(any(UpdateProfileRequest.class));

        mockMvc.perform(put("/api/profile/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateCurrentUserUnauthorised() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("new.email@example.com");

        doThrow(new AuthenticatedAccountNotFoundException())
                .when(profileService).updateProfile(any(UpdateProfileRequest.class));

        mockMvc.perform(put("/api/profile/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(status().reason("Invalid or expired refresh token"));
    }

    @Test
    void testUpdateCurrentUserBadRequest() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setOldPassword("wrongpassword");
        request.setNewPassword("newpass123");
        request.setConfirmNewPassword("newpass123");

        doThrow(new IllegalArgumentException("Current password is incorrect"))
                .when(profileService).updateProfile(any(UpdateProfileRequest.class));

        mockMvc.perform(put("/api/profile/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason("Current password is incorrect"));
    }

    @Test
    void testUpdateCurrentUserInternalServerError() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setEmail("new.email@example.com");

        doThrow(new RuntimeException("Unexpected failure"))
                .when(profileService).updateProfile(any(UpdateProfileRequest.class));

        mockMvc.perform(put("/api/profile/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(status().reason("Internal server error"));
    }
}