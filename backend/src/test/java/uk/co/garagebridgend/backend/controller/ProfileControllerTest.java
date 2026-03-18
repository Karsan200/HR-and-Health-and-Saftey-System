package uk.co.garagebridgend.backend.controller;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.MockedStatic;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.ProfileService;
import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.ProfileResponse;

import org.springframework.security.core.userdetails.User;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

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

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private ProfileController profileController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        // Build MockMvc with GlobalExceptionHandler to map exceptions to HTTP status
        mockMvc = MockMvcBuilders.standaloneSetup(profileController)
                .build();
    }

    @Test
    void testGetCurrentUserSuccess() throws Exception {
        // Arrange: mock ProfileResponse
        ProfileResponse mockProfile = new ProfileResponse(
                "John",
                "Doe",
                "john.doe@example.com",
                "1234567890",
                "18 March 2026"
        );

        when(profileService.getCurrentProfile()).thenReturn(mockProfile);

        // Mock AuthenticationService.getCurrentUser() to return a valid user
        try (MockedStatic<AuthenticationService> authMock = org.mockito.Mockito.mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(new User("123", "password", Collections.emptyList()));

            // Act & Assert
            mockMvc.perform(get("/profile/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName", is("John")))
                    .andExpect(jsonPath("$.lastName", is("Doe")))
                    .andExpect(jsonPath("$.email", is("john.doe@example.com")))
                    .andExpect(jsonPath("$.phoneNumber", is("1234567890")))
                    .andExpect(jsonPath("$.created", is("18 March 2026")));
        }
    }
    @Test
    void testGetCurrentUserUnauthorised() throws Exception {
        //arrange
        when(profileService.getCurrentProfile()).thenThrow(new AuthenticatedAccountNotFoundException());
        // Act & Arrange
        mockMvc.perform(get("/api/profile/me")).andExpect(status().isUnauthorized()).andExpect(status().reason("Invalid or expired refresh token"));
    }

    @Test
    void testGetCurrentUserInternalServerError() throws Exception {
        // Arrange
        when(profileService.getCurrentProfile()).thenThrow(new RuntimeException("Something went wrong"));

        // Act & Assert
        mockMvc.perform(get("/api/profile/me")).andExpect(status().isInternalServerError()).andExpect(status().reason("Internal server error"));
    }


}