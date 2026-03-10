package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uk.co.garagebridgend.backend.logic.LeaveService;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests for {@link LeaveController}.
 */
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
    void testGetLeaveForDayValid() throws Exception {

        List<LeaveDayResponse> mockData = List.of(
                new LeaveDayResponse(
                        "John Doe",
                        "Technician",
                        LocalDateTime.now().plusDays(2)
                )
        );

        when(leaveService.getLeaveForDate(LocalDate.parse("2026-03-01")))
                .thenReturn(mockData);

        mockMvc.perform(get("/api/leave/day/2026-03-01"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetLeaveForDayInvalidDate() throws Exception {

        mockMvc.perform(get("/api/leave/day/not-a-date"))
                .andExpect(status().isBadRequest());
    }
}
