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
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;
import uk.co.garagebridgend.backend.models.request.LeaveRequest;
import uk.co.garagebridgend.backend.models.response.LeaveTypeResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.LeaveTypeRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for {@link LeaveService}.
 */
@ActiveProfiles("test")
@Transactional
public class LeaveServiceTest {

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private LeaveTypeRepository leaveTypeRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private LeaveService leaveService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    private LocalDate getNextMondayToThursdayAtLeast14DaysAhead() {
        LocalDate date = LocalDate.now().plusDays(20);

        while (date.getDayOfWeek().getValue() >= 5) {
            date = date.plusDays(1);
        }

        return date;
    }

    private LocalDate getNextFridayAtLeast14DaysAhead() {
        LocalDate date = LocalDate.now().plusDays(20);

        while (date.getDayOfWeek().getValue() != 5) {
            date = date.plusDays(1);
        }

        return date;
    }

    private LeaveRequest buildValidLeaveRequest() {
        LocalDate date = getNextMondayToThursdayAtLeast14DaysAhead();

        LeaveRequest request = new LeaveRequest();
        request.setStartDate(date.atTime(8, 0));
        request.setEndDate(date.atTime(17, 0));
        request.setLeaveTypeId(1);
        request.setNotes("Annual leave");

        return request;
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

        var leaveResponse = result.getFirst();
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
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

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
        approvedLeave.setStartDate(LocalDateTime.of(2026, 3, 2, 8, 0));   // Monday 08:00
        approvedLeave.setEndDate(LocalDateTime.of(2026, 3, 3, 17, 0));    // Tuesday 17:00

        LeaveTable pendingLeave = new LeaveTable();
        pendingLeave.setAccount(account);
        pendingLeave.setApproved(false);
        pendingLeave.setStartDate(LocalDateTime.of(2026, 3, 4, 8, 0)); // Wednesday 08:00
        pendingLeave.setEndDate(LocalDateTime.of(2026, 3, 4, 17, 0)); // Wednesday 17:00

        when(leaveRepository.findAll()).thenReturn(List.of(approvedLeave, pendingLeave));

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

            // Approved = 1, Pending = 1
            assertEquals(1, summary.getApprovedCount());
            assertEquals(1, summary.getPendingCount());
            assertEquals(142, summary.getTotalDays());
        }
    }

    @Test
    void testGetLeaveSummaryForCurrentUserNoAuthenticatedUser() {
        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(null);

            assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                    leaveService.getLeaveSummaryForCurrentUser()
            );
        }
    }

    @Test
    void testGetLeaveForDateFullDay() {

        // Given an approved full-day leave matching the normal Monday to Thursday working hours
        AccountTable account = new AccountTable();
        account.setFirstName("Jane");
        account.setLastName("Smith");

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setStartDate(LocalDateTime.of(2026, 3, 2, 8, 0));
        leave.setEndDate(LocalDateTime.of(2026, 3, 2, 17, 0));
        leave.setApproved(true);

        LocalDate date = LocalDate.parse("2026-03-02");
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        when(leaveRepository.findLeaveForDate(startOfDay, endOfDay))
                .thenReturn(List.of(leave));

        // When leave is requested for that specific full-day booking
        var result = leaveService.getLeaveForDate("2026-03-02");

        // Then the leave should be identified as not being a partial day
        assertEquals(1, result.size());
        assertFalse(result.getFirst().isPartialDay());
    }

    @Test
    void testGetLeaveSummaryForCurrentUserPartialDayApprovedLeave() {

        // Given an authenticated user with one approved partial-day leave booking
        User mockUser = new User("1", "pass", List.of());

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        LeaveTable approvedLeave = new LeaveTable();
        approvedLeave.setAccount(account);
        approvedLeave.setApproved(true);
        approvedLeave.setStartDate(LocalDateTime.of(2026, 3, 3, 10, 0));
        approvedLeave.setEndDate(LocalDateTime.of(2026, 3, 3, 15, 0));

        when(leaveRepository.findAll()).thenReturn(List.of(approvedLeave));

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            // When the summary is calculated for the current user
            LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

            // Then only the hours for that partial leave should be deducted from the allowance
            assertEquals(1, summary.getApprovedCount());
            assertEquals(0, summary.getPendingCount());
            assertEquals(155, summary.getTotalDays());
        }
    }

    @Test
    void testGetLeaveSummaryForCurrentUserFridayAndWeekendIgnored() {

        // Given an approved leave spanning Friday through Monday
        User mockUser = new User("1", "pass", List.of());

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        LeaveTable approvedLeave = new LeaveTable();
        approvedLeave.setAccount(account);
        approvedLeave.setApproved(true);
        approvedLeave.setStartDate(LocalDateTime.of(2026, 3, 6, 8, 0));
        approvedLeave.setEndDate(LocalDateTime.of(2026, 3, 9, 17, 0));

        when(leaveRepository.findAll()).thenReturn(List.of(approvedLeave));

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            // When the summary is calculated for a leave crossing a weekend
            LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

            // Then Friday and Monday hours should count, but weekend days should be ignored
            assertEquals(1, summary.getApprovedCount());
            assertEquals(0, summary.getPendingCount());
            assertEquals(147, summary.getTotalDays());
        }
    }

    @Test
    void testGetLeaveSummaryForCurrentUserEndBeforeStartReturnsZeroUsedHours() {

        // Given an approved leave with an invalid range where the end is before the start
        User mockUser = new User("1", "pass", List.of());

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        LeaveTable approvedLeave = new LeaveTable();
        approvedLeave.setAccount(account);
        approvedLeave.setApproved(true);
        approvedLeave.setStartDate(LocalDateTime.of(2026, 3, 3, 17, 0));
        approvedLeave.setEndDate(LocalDateTime.of(2026, 3, 3, 8, 0));

        when(leaveRepository.findAll()).thenReturn(List.of(approvedLeave));

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            // When the summary is calculated for that invalid leave record
            LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

            // Then the leave should contribute zero used hours and not reduce the allowance
            assertEquals(1, summary.getApprovedCount());
            assertEquals(0, summary.getPendingCount());
            assertEquals(160, summary.getTotalDays());
        }
    }

    @Test
    void testGetLeaveTypesSuccess() {

        // Given one leave type exists in the repository
        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setLeaveTypeId(1);
        leaveType.setName("Annual Leave");
        leaveType.setColourIcon("#111111");
        leaveType.setColourBg("#FFFFFF");
        leaveType.setIconType("calendar");

        when(leaveTypeRepository.findAll()).thenReturn(List.of(leaveType));

        // When all leave types are requested
        List<LeaveTypeResponse> result = leaveService.getLeaveTypes();

        // Then the leave type should be mapped correctly into the response model
        assertEquals(1, result.size());
        assertEquals(1, result.getFirst().getLeaveTypeId());
        assertEquals("Annual Leave", result.getFirst().getName());
        assertEquals("#111111", result.getFirst().getColourIcon());
        assertEquals("#FFFFFF", result.getFirst().getColourBg());
        assertEquals("calendar", result.getFirst().getIconType());
    }

    @Test
    void testCreateLeaveSuccess() {

        // Given a valid leave request, a valid authenticated account and a valid leave type
        LeaveRequest request = buildValidLeaveRequest();

        User mockUser = new User("1", "pass", List.of());

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setLeaveTypeId(1);
        leaveType.setName("Annual Leave");

        when(leaveRepository.findLeaveForDate(any(), any())).thenReturn(List.of());
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(leaveTypeRepository.findById(1)).thenReturn(Optional.of(leaveType));

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            // When a new leave request is created
            leaveService.createLeave(request);

            // Then the leave should be saved to the repository
            verify(leaveRepository).save(any(LeaveTable.class));
        }
    }

    @Test
    void testCreateLeaveNullRequest() {

        // Given a null leave request object
        LeaveRequest request = null;

        // When the service attempts to create leave from the null request
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request as missing
        assertEquals("Leave request is required.", exception.getMessage());
    }

    @Test
    void testCreateLeaveMissingDates() {

        // Given a leave request where the start and end dates are missing
        LeaveRequest request = new LeaveRequest();
        request.setLeaveTypeId(1);

        // When the service validates and creates the leave request
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request because dates are required
        assertEquals("Start date and end date are required.", exception.getMessage());
    }

    @Test
    void testCreateLeaveEndBeforeStart() {

        // Given a leave request where the end date is before the start date
        LeaveRequest request = new LeaveRequest();
        request.setStartDate(LocalDateTime.now().plusDays(20));
        request.setEndDate(LocalDateTime.now().plusDays(19));
        request.setLeaveTypeId(1);

        // When the service validates the request dates
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request as an invalid date range
        assertEquals("End date cannot be before start date.", exception.getMessage());
    }

    @Test
    void testCreateLeaveMissingLeaveTypeId() {

        // Given a leave request with valid dates but no leave type selected
        LeaveRequest request = new LeaveRequest();
        request.setStartDate(LocalDateTime.now().plusDays(20));
        request.setEndDate(LocalDateTime.now().plusDays(20).plusHours(1));

        // When the service validates the request
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request because the leave type is required
        assertEquals("Leave type is required.", exception.getMessage());
    }

    @Test
    void testCreateLeaveNotInAdvance() {

        // Given a leave request that is not at least fourteen days in advance
        LeaveRequest request = new LeaveRequest();
        request.setStartDate(LocalDate.now().plusDays(1).atTime(8, 0));
        request.setEndDate(LocalDate.now().plusDays(1).atTime(17, 0));
        request.setLeaveTypeId(1);

        // When the service validates the booking advance period
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request for being too soon
        assertEquals("Leave requests must be made at least 14 days in advance.", exception.getMessage());
    }

    @Test
    void testCreateLeaveStartTimeOutsideWorkingHours() {

        // Given a request on a normal weekday where the start time is before working hours
        LocalDate date = getNextMondayToThursdayAtLeast14DaysAhead();

        LeaveRequest request = new LeaveRequest();
        request.setStartDate(date.atTime(7, 59));
        request.setEndDate(date.atTime(17, 0));
        request.setLeaveTypeId(1);

        // When the service validates the start time
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request because the start time is invalid
        assertEquals("Start time must be within working hours.", exception.getMessage());
    }

    @Test
    void testCreateLeaveEndTimeOutsideWorkingHours() {

        // Given a request on a normal weekday where the end time is after working hours
        LocalDate date = getNextMondayToThursdayAtLeast14DaysAhead();

        LeaveRequest request = new LeaveRequest();
        request.setStartDate(date.atTime(8, 0));
        request.setEndDate(date.atTime(17, 1));
        request.setLeaveTypeId(1);

        // When the service validates the end time
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request because the end time is invalid
        assertEquals("End time must be within working hours.", exception.getMessage());
    }

    @Test
    void testCreateLeaveFridayEndTimeOutsideWorkingHours() {

        // Given a Friday leave request where the end time is after the shorter Friday working hours
        LocalDate friday = getNextFridayAtLeast14DaysAhead();

        LeaveRequest request = new LeaveRequest();
        request.setStartDate(friday.atTime(8, 0));
        request.setEndDate(friday.atTime(12, 1));
        request.setLeaveTypeId(1);

        // When the service validates the Friday end time
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the service should reject the request because Friday ends at 12:00
        assertEquals("End time must be within working hours.", exception.getMessage());
    }

    @Test
    void testCreateLeaveDayCapacityFull() {

        // Given a valid leave request but the selected day already has two approved leave bookings
        LeaveRequest request = buildValidLeaveRequest();

        LeaveTable leaveOne = new LeaveTable();
        leaveOne.setApproved(true);

        LeaveTable leaveTwo = new LeaveTable();
        leaveTwo.setApproved(true);

        when(leaveRepository.findLeaveForDate(any(), any())).thenReturn(List.of(leaveOne, leaveTwo));

        // When the service checks day capacity before saving
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the request should be rejected because the day is already fully booked
        assertEquals("One or more selected dates are fully booked.", exception.getMessage());
    }

    @Test
    void testCreateLeaveNoAuthenticatedUser() {

        // Given a valid leave request but no authenticated user is present
        LeaveRequest request = buildValidLeaveRequest();
        when(leaveRepository.findLeaveForDate(any(), any())).thenReturn(List.of());

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(null);

            // When the service attempts to create leave without an authenticated user
            assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                    leaveService.createLeave(request)
            );

            // Then the leave should not be saved
            verify(leaveRepository, never()).save(any(LeaveTable.class));
        }
    }

    @Test
    void testCreateLeaveAuthenticatedAccountNotFound() {

        // Given a valid request and authenticated user id, but no matching account exists in the repository
        LeaveRequest request = buildValidLeaveRequest();
        User mockUser = new User("1", "pass", List.of());

        when(leaveRepository.findLeaveForDate(any(), any())).thenReturn(List.of());
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            // When the service attempts to load the authenticated account
            assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                    leaveService.createLeave(request)
            );

            // Then the leave should not be saved because the account could not be found
            verify(leaveRepository, never()).save(any(LeaveTable.class));
        }
    }

    @Test
    void testCreateLeaveInvalidLeaveTypeId() {

        // Given a valid request and authenticated account, but the leave type id does not exist
        LeaveRequest request = buildValidLeaveRequest();
        User mockUser = new User("1", "pass", List.of());

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        when(leaveRepository.findLeaveForDate(any(), any())).thenReturn(List.of());
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(leaveTypeRepository.findById(1)).thenReturn(Optional.empty());

        try (MockedStatic<AuthenticationService> authMock = mockStatic(AuthenticationService.class)) {
            authMock.when(AuthenticationService::getCurrentUser).thenReturn(mockUser);

            // When the service tries to resolve the leave type during creation
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                    leaveService.createLeave(request)
            );

            // Then the request should be rejected because the leave type id is invalid
            assertEquals("Invalid leave type id.", exception.getMessage());
        }
    }
}