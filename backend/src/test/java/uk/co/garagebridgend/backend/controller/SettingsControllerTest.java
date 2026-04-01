package uk.co.garagebridgend.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.logic.SettingsService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.SettingsResponse;

import java.sql.Time;
import java.util.Collections;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller tests for {@link SettingsController}.
 */
@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
@WithMockUser
public class SettingsControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private SettingsService settingsService;

    @InjectMocks
    private SettingsController settingsController;

    @Mock
    private AuthenticationService authenticationService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(settingsController).build();
        objectMapper = new ObjectMapper();
    }

    // -------------------------------------------------------------------------
    // GET /api/settings
    // -------------------------------------------------------------------------

    @Test
    @WithMockUser
    void testGetSettingsSuccess() throws Exception {
        SettingsResponse mockSettings = new SettingsResponse();
        mockSettings.setLargeText(true);
        mockSettings.setDyslexicFont(false);
        mockSettings.setHighlightText(true);
        mockSettings.setTextToSpeech(false);
        mockSettings.setDictation(true);
        mockSettings.setSilentStart(Time.valueOf("22:00:00"));
        mockSettings.setSilentEnd(Time.valueOf("07:00:00"));
        mockSettings.setThemePreset("DEFAULT");
        mockSettings.setAccentColour("#D20414");
        mockSettings.setBackgroundColour("#F6F6F8");
        mockSettings.setTextColour("#000000");

        when(settingsService.getAllSettings()).thenReturn(mockSettings);

        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.largeText",        is(true)))
                .andExpect(jsonPath("$.dyslexicFont",     is(false)))
                .andExpect(jsonPath("$.highlightText",    is(true)))
                .andExpect(jsonPath("$.textToSpeech",     is(false)))
                .andExpect(jsonPath("$.dictation",        is(true)))
                .andExpect(jsonPath("$.silentStart",      is("22:00:00")))
                .andExpect(jsonPath("$.silentEnd",        is("07:00:00")))
                .andExpect(jsonPath("$.themePreset",      is("DEFAULT")))
                .andExpect(jsonPath("$.accentColour",     is("#D20414")))
                .andExpect(jsonPath("$.backgroundColour", is("#F6F6F8")))
                .andExpect(jsonPath("$.textColour",       is("#000000")));
    }

    @Test
    @WithMockUser
    void testGetSettingsUnauthorised() throws Exception {
        when(settingsService.getAllSettings())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isUnauthorized())
                .andExpect(status().reason("Invalid or expired refresh token"));
    }

    @Test
    @WithMockUser
    void testGetSettingsInternalServerError() throws Exception {
        when(settingsService.getAllSettings())
                .thenThrow(new RuntimeException("Unexpected failure"));

        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isInternalServerError())
                .andExpect(status().reason("Internal server error"));
    }

    // -------------------------------------------------------------------------
    // PUT /api/settings
    // -------------------------------------------------------------------------

    @Test
    @WithMockUser
    void testUpdateSettingsSuccess() throws Exception {
        SettingsResponse updateRequest = new SettingsResponse();
        updateRequest.setLargeText(false);
        updateRequest.setDyslexicFont(true);
        updateRequest.setHighlightText(false);
        updateRequest.setTextToSpeech(true);
        updateRequest.setDictation(false);
        updateRequest.setSilentStart(Time.valueOf("23:00:00"));
        updateRequest.setSilentEnd(Time.valueOf("06:00:00"));
        updateRequest.setThemePreset("DARK");
        updateRequest.setAccentColour("#FFFFFF");
        updateRequest.setBackgroundColour("#000000");
        updateRequest.setTextColour("#CCCCCC");

        doNothing().when(settingsService).updateAllSettings(any(SettingsResponse.class));

        var account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        mockMvc.perform(put("/api/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void testUpdateSettingsUnauthorised() throws Exception {
        SettingsResponse updateRequest = new SettingsResponse();
        updateRequest.setThemePreset("DARK");

        doThrow(new AuthenticatedAccountNotFoundException())
                .when(settingsService).updateAllSettings(any(SettingsResponse.class));

        mockMvc.perform(put("/api/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(status().reason("Invalid or expired refresh token"));
    }

    @Test
    @WithMockUser
    void testUpdateSettingsInternalServerError() throws Exception {
        SettingsResponse updateRequest = new SettingsResponse();
        updateRequest.setThemePreset("DARK");

        doThrow(new RuntimeException("Unexpected failure"))
                .when(settingsService).updateAllSettings(any(SettingsResponse.class));

        mockMvc.perform(put("/api/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isInternalServerError())
                .andExpect(status().reason("Internal server error"));
    }
}