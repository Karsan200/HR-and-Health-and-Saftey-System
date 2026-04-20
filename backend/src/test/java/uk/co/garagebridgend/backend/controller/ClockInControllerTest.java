package uk.co.garagebridgend.backend.controller;

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
import uk.co.garagebridgend.backend.logic.ClockInService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ClockInRecordResponse;
import uk.co.garagebridgend.backend.models.response.ClockInStatusResponse;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests for {@link ClockInController}.
 */
@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
public class ClockInControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClockInService clockInService;

    @InjectMocks
    private ClockInController clockInController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(clockInController).build();
    }

    // /api/clock/status

    @Test
    void testGetStatusSuccess() throws Exception {

        // Given the service returns a valid status response for the authenticated user
        ClockInStatusResponse mockResponse = new ClockInStatusResponse(
                "08:00", "17:00", "Tuesday, 7 April, 2026",
                1, 90.0, 8.5, 20,"10:10"
        );

        when(clockInService.getStatus()).thenReturn(mockResponse);

        // When the client calls the status endpoint
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(get("/api/clock/status"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetStatusUnauthorized() throws Exception {

        // Given the service throws an exception because no user is authenticated
        when(clockInService.getStatus())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When the client calls the status endpoint without a valid session
        // Then the controller should return HTTP 401 (Unauthorised)
        mockMvc.perform(get("/api/clock/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetStatusThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        when(clockInService.getStatus())
                .thenThrow(new RuntimeException("Database error"));

        // When the client calls the status endpoint
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(get("/api/clock/status"))
                .andExpect(status().isInternalServerError());
    }

    // /api/clock/records

    @Test
    void testGetRecentRecordsSuccess() throws Exception {

        // Given the service returns a list of recent clock-in records
        List<ClockInRecordResponse> mockRecords = List.of(
                new ClockInRecordResponse(
                        UUID.randomUUID(), "08:00", "17:00", "Tuesday, 7 April, 2026"
                )
        );

        when(clockInService.getRecentRecords()).thenReturn(mockRecords);

        // When the client calls the records endpoint
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(get("/api/clock/records"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetRecentRecordsEmpty() throws Exception {

        // Given the service returns an empty list because the user has no records
        when(clockInService.getRecentRecords()).thenReturn(List.of());

        // When the client calls the records endpoint
        // Then the controller should still return HTTP 200 (OK) with an empty list
        mockMvc.perform(get("/api/clock/records"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetRecentRecordsUnauthorized() throws Exception {

        // Given the service throws an exception because no user is authenticated
        when(clockInService.getRecentRecords())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When the client calls the records endpoint without a valid session
        // Then the controller should return HTTP 401 (Unauthorised)
        mockMvc.perform(get("/api/clock/records"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetRecentRecordsThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        when(clockInService.getRecentRecords())
                .thenThrow(new RuntimeException("Database error"));

        // When the client calls the records endpoint
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(get("/api/clock/records"))
                .andExpect(status().isInternalServerError());
    }

    // /api/clock/report

    @Test
    void testReportIssueSuccess() throws Exception {

        // Given the service successfully saves the report
        doNothing().when(clockInService).reportIssue(any(UUID.class), any(String.class));

        // When the client submits a valid report request
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(post("/api/clock/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockId": "%s",
                            "issue": "I arrived on time but was clocked in late."
                        }
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isOk());
    }

    @Test
    void testReportIssueUnauthorized() throws Exception {

        // Given the service throws an exception because no user is authenticated
        doThrow(new AuthenticatedAccountNotFoundException())
                .when(clockInService).reportIssue(any(UUID.class), any(String.class));

        // When the client submits a report without a valid session
        // Then the controller should return HTTP 401 (Unauthorised)
        mockMvc.perform(post("/api/clock/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockId": "%s",
                            "issue": "I arrived on time but was clocked in late."
                        }
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testReportIssueBlankIssue() throws Exception {

        // Given the service rejects the request because the issue description is blank
        doThrow(new IllegalArgumentException("Issue description must not be blank."))
                .when(clockInService).reportIssue(any(UUID.class), any(String.class));

        // When the client submits a report with a blank issue field
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/clock/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockId": "%s",
                            "issue": ""
                        }
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testReportIssueClockIdNotFound() throws Exception {

        // Given the service rejects the request because the clock ID does not exist
        doThrow(new IllegalArgumentException("Clock-in record not found."))
                .when(clockInService).reportIssue(any(UUID.class), any(String.class));

        // When the client submits a report referencing a non-existent clock-in record
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/clock/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockId": "%s",
                            "issue": "My clock-in time was wrong."
                        }
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testReportIssueRecordBelongsToDifferentAccount() throws Exception {

        // Given the service rejects the request because the record belongs to a different account
        doThrow(new IllegalArgumentException("Clock-in record does not belong to this account."))
                .when(clockInService).reportIssue(any(UUID.class), any(String.class));

        // When the client submits a report for a record that is not theirs
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/clock/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockId": "%s",
                            "issue": "My clock-in time was wrong."
                        }
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testReportIssueThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        doThrow(new RuntimeException("Database error"))
                .when(clockInService).reportIssue(any(UUID.class), any(String.class));

        // When the client submits a report
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(post("/api/clock/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockId": "%s",
                            "issue": "My clock-in time was wrong."
                        }
                        """.formatted(UUID.randomUUID())))
                .andExpect(status().isInternalServerError());
    }
}