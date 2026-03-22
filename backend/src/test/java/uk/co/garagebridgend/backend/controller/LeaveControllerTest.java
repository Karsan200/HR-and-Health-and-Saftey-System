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

import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.LeaveService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
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
}
