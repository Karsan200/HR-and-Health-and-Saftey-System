package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.repository.LeaveRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

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
        leave.setStartDate(LocalDateTime.now());
        leave.setEndDate(LocalDateTime.now().plusDays(1));
        leave.setApproved(true);

        when(leaveRepository.findLeaveForDate(LocalDate.parse("2026-03-01").atStartOfDay()))
                .thenReturn(List.of(leave));

        var result = leaveService.getLeaveForDate("2026-03-01");

        assertEquals(1, result.size());
        assertEquals("John Doe", result.getFirst().getName());
        assertEquals("Technician", result.getFirst().getRole());
    }

    @Test
    void testGetLeaveForDateEmpty() {

        when(leaveRepository.findLeaveForDate(LocalDate.parse("2026-03-01").atStartOfDay()))
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
}