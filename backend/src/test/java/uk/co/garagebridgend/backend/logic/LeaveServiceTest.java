package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;

import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.repository.LeaveRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests for {@link LeaveService}.
 */
@ActiveProfiles("test")
@Transactional
public class LeaveServiceTest {

    @Mock
    private LeaveRepository leaveRepository;

    @InjectMocks
    private LeaveService leaveService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllLeaveDates() {

        LeaveTable leave = new LeaveTable();
        leave.setStartDate(LocalDateTime.now());
        leave.setEndDate(LocalDateTime.now().plusDays(2));
        leave.setApproved(true);

        when(leaveRepository.findAll()).thenReturn(List.of(leave));

        var result = leaveService.getAllLeaveDates();

        assertEquals(1, result.size());
        assertNotNull(result.getFirst().getStartDate());
        assertNotNull(result.getFirst().getEndDate());
    }

    @Test
    void testGetAllLeaveDatesEmpty() {

        when(leaveRepository.findAll()).thenReturn(List.of());

        var result = leaveService.getAllLeaveDates();

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetLeaveForDate() {

        AccountTable account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setStartDate(LocalDateTime.of(2026, 3, 1, 10, 0));
        leave.setEndDate(LocalDateTime.of(2026, 3, 1, 14, 0));
        leave.setApproved(true);

        LocalDate date = LocalDate.parse("2026-03-01");
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        when(leaveRepository.findLeaveForDate(startOfDay, endOfDay))
                .thenReturn(List.of(leave));

        var result = leaveService.getLeaveForDate("2026-03-01");

        assertEquals(1, result.size());

        var leaveResponse = result.get(0);
        assertEquals("John Doe", leaveResponse.getName());
        assertEquals("Technician", leaveResponse.getRole());
        assertEquals(leave.getStartDate(), leaveResponse.getStartDate());
        assertEquals(leave.getEndDate(), leaveResponse.getEndDate());
        assertTrue(leaveResponse.isPartialDay());
    }

    @Test
    void testGetLeaveForDateEmpty() {

        LocalDate date = LocalDate.parse("2026-03-01");
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        when(leaveRepository.findLeaveForDate(startOfDay, endOfDay))
                .thenReturn(List.of());

        var result = leaveService.getLeaveForDate("2026-03-01");

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetLeaveForDateInvalidFormat() {
        assertThrows(IllegalArgumentException.class, () -> {
            leaveService.getLeaveForDate("invalid-date");
        });
    }

    @Test
    void testGetLeaveSummaryForCurrentUserSuccess() {
        // Mock authenticated user
        User mockUser = new User("1", "pass", List.of());

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        LeaveTable approvedLeave = new LeaveTable();
        approvedLeave.setAccount(account);
        approvedLeave.setApproved(true);
        approvedLeave.setStartDate(LocalDateTime.of(2026, 3, 1, 0, 0));
        approvedLeave.setEndDate(LocalDateTime.of(2026, 3, 2, 0, 0)); // 2 full days

        LeaveTable pendingLeave = new LeaveTable();
        pendingLeave.setAccount(account);
        pendingLeave.setApproved(false);
        pendingLeave.setStartDate(LocalDateTime.of(2026, 3, 3, 0, 0));
        pendingLeave.setEndDate(LocalDateTime.of(2026, 3, 3, 0, 0)); // 1 full day

        when(leaveRepository.findAll()).thenReturn(List.of(approvedLeave, pendingLeave));

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

            // Approved = 1, Pending = 1
            assertEquals(1, summary.getApprovedCount());
            assertEquals(1, summary.getPendingCount());

            // 2 full days = 16 hours, allowance = 160 - 16 = 144
            assertEquals(144, summary.getTotalDays());
        }
    }

    @Test
    void testGetLeaveSummaryForCurrentUserNoAuthenticatedUser() {
        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(null);

            assertThrows(RuntimeException.class, () -> leaveService.getLeaveSummaryForCurrentUser());
        }
    }
}