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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import org.springframework.http.MediaType;

import uk.co.garagebridgend.backend.models.request.LeaveRequest;
import uk.co.garagebridgend.backend.models.response.*;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.LeaveService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests for {@link LeaveController}.
 */
@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
public class LeaveControllerTest {

    private MockMvc mockMvc;

    @Mock
    private LeaveService leaveService;

    @InjectMocks
    private LeaveController leaveController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(leaveController).build();
    }

    @Test
    void testGetAdminCalendarSuccess() throws Exception {
        List<LeaveCalendarAdminResponse> mockData = List.of(
                new LeaveCalendarAdminResponse(
                        LocalDate.of(2026, 4, 1),
                        "John Doe",
                        "bookedLeave",
                        "Annual leave"
                )
        );

        when(leaveService.getCalendarItems(2026, 4)).thenReturn(mockData);

        mockMvc.perform(get("/api/leave/admin/calendar")
                        .param("year", "2026")
                        .param("month", "4"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetAdminCalendarInvalidMonthTooLow() throws Exception {
        mockMvc.perform(get("/api/leave/admin/calendar")
                        .param("year", "2026")
                        .param("month", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAdminCalendarInvalidMonthTooHigh() throws Exception {
        mockMvc.perform(get("/api/leave/admin/calendar")
                        .param("year", "2026")
                        .param("month", "13"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAdminCalendarUnauthorized() throws Exception {
        when(leaveService.getCalendarItems(2026, 4))
                .thenThrow(new AuthenticatedAccountNotFoundException());

        mockMvc.perform(get("/api/leave/admin/calendar")
                        .param("year", "2026")
                        .param("month", "4"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetAdminCalendarBadRequest() throws Exception {
        when(leaveService.getCalendarItems(2026, 4))
                .thenThrow(new IllegalArgumentException("Invalid year."));

        mockMvc.perform(get("/api/leave/admin/calendar")
                        .param("year", "2026")
                        .param("month", "4"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAdminCalendarThrowsException() throws Exception {
        when(leaveService.getCalendarItems(2026, 4))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/api/leave/admin/calendar")
                        .param("year", "2026")
                        .param("month", "4"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetCalendarLeave() throws Exception {

        List<LeaveCalendarResponse> mockData = List.of(
                new LeaveCalendarResponse(
                        LocalDateTime.now(),
                        LocalDateTime.now().plusDays(1)
                )
        );

        when(leaveService.getAllLeaveDates()).thenReturn(mockData);

        mockMvc.perform(get("/api/leave/calendar"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetCalendarLeaveThrowsException() throws Exception {

        when(leaveService.getAllLeaveDates()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/api/leave/calendar"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetLeaveForDayValid() throws Exception {

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusHours(2);

        List<LeaveDayResponse> mockData = List.of(
                new LeaveDayResponse(
                        "John Doe",
                        "Technician",
                        start,
                        end,
                        true // partialDay = true
                )
        );

        when(leaveService.getLeaveForDate("2026-03-01"))
                .thenReturn(mockData);

        mockMvc.perform(get("/api/leave/day/2026-03-01"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetLeaveForDayInvalidDate() throws Exception {
        when(leaveService.getLeaveForDate("invalid-date"))
                .thenThrow(new IllegalArgumentException("Invalid date format. Expected format: YYYY-MM-DD"));

        mockMvc.perform(get("/api/leave/day/invalid-date"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetLeaveForDayThrowsException() throws Exception {
        when(leaveService.getLeaveForDate("2026-03-01"))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/api/leave/day/2026-03-01"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetSummarySuccess() throws Exception {
        LeaveSummaryResponse mockSummary = new LeaveSummaryResponse(
                120, // remainingHours
                2,   // pendingCount
                5    // approvedCount
        );

        when(leaveService.getLeaveSummaryForCurrentUser()).thenReturn(mockSummary);

        mockMvc.perform(get("/api/leave/summary"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetSummaryThrowsException() throws Exception {
        when(leaveService.getLeaveSummaryForCurrentUser()).thenThrow(new RuntimeException("Auth error"));

        mockMvc.perform(get("/api/leave/summary"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testGetSummaryUnauthorized() throws Exception {
        when(leaveService.getLeaveSummaryForCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        mockMvc.perform(get("/api/leave/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetLeaveTypesSuccess() throws Exception {

        // Given the leave service returns a list of leave types for the request
        List<LeaveTypeResponse> mockTypes = List.of(
                new LeaveTypeResponse(
                        1,
                        "Annual Leave",
                        "#111111",
                        "#FFFFFF",
                        "calendar"
                )
        );

        when(leaveService.getLeaveTypes()).thenReturn(mockTypes);

        // When the client calls the leave types endpoint, Then the controller should return HTTP 200 (OK)
        mockMvc.perform(get("/api/leave/types"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetLeaveTypesThrowsException() throws Exception {

        // Given the leave service throws an unexpected exception while retrieving leave types
        when(leaveService.getLeaveTypes()).thenThrow(new RuntimeException("Database error"));

        // When the client calls the leave types endpoint,
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(get("/api/leave/types"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testCreateLeaveSuccess() throws Exception {

        // Given the leave service successfully processes a valid leave request
        doNothing().when(leaveService).createLeave(any(LeaveRequest.class));

        // When the client submits a valid leave request to the create endpoint
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(post("/api/leave/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "startDate": "2026-04-20T08:00:00",
                            "endDate": "2026-04-20T17:00:00",
                            "leaveTypeId": 1,
                            "notes": "Annual leave"
                        }
                        """))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateLeaveUnauthorized() throws Exception {

        // Given the leave service throws an exception because the user is not authenticated
        doThrow(new AuthenticatedAccountNotFoundException())
                .when(leaveService).createLeave(any(LeaveRequest.class));

        // When the client submits a leave request without a valid authenticated account
        // Then the controller should return HTTP 401 (Unauthorised)
        mockMvc.perform(post("/api/leave/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "startDate": "2026-04-20T08:00:00",
                            "endDate": "2026-04-20T17:00:00",
                            "leaveTypeId": 1,
                            "notes": "Annual leave"
                        }
                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCreateLeaveBadRequest() throws Exception {

        // Given the leave service rejects the request due to invalid input data
        doThrow(new IllegalArgumentException("Leave type is required."))
                .when(leaveService).createLeave(any(LeaveRequest.class));

        // When the client submits an invalid leave request, Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/leave/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "startDate": "2026-04-20T08:00:00",
                            "endDate": "2026-04-20T17:00:00",
                            "notes": "Annual leave"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateLeaveThrowsException() throws Exception {

        // Given the leave service throws an unexpected runtime exception
        doThrow(new RuntimeException("Unexpected error"))
                .when(leaveService).createLeave(any(LeaveRequest.class));

        // When the client submits a leave request, Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(post("/api/leave/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "startDate": "2026-04-20T08:00:00",
                            "endDate": "2026-04-20T17:00:00",
                            "leaveTypeId": 1,
                            "notes": "Annual leave"
                        }
                        """))
                .andExpect(status().isInternalServerError());
    }
}
