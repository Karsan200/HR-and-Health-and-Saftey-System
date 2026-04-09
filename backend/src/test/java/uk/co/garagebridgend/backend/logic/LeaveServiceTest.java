package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.models.response.PendingLeaveResponse;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;
import uk.co.garagebridgend.backend.models.request.LeaveDecisionRequest;
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

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private LeaveService leaveService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(leaveService, "totalAllowanceHours", 160);
        ReflectionTestUtils.setField(leaveService, "minimumAdvanceBookingDays", 14);
        ReflectionTestUtils.setField(leaveService, "maxApprovedPerDay", 2);
        ReflectionTestUtils.setField(leaveService, "mondayToThursdayStartTime", LocalTime.of(8, 0));
        ReflectionTestUtils.setField(leaveService, "mondayToThursdayEndTime", LocalTime.of(17, 0));
        ReflectionTestUtils.setField(leaveService, "fridayStartTime", LocalTime.of(8, 0));
        ReflectionTestUtils.setField(leaveService, "fridayEndTime", LocalTime.of(12, 0));
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
        approvedLeave.setStartDate(LocalDateTime.of(2026, 3, 2, 8, 0));
        approvedLeave.setEndDate(LocalDateTime.of(2026, 3, 3, 17, 0));

        LeaveTable pendingLeave = new LeaveTable();
        pendingLeave.setAccount(account);
        pendingLeave.setApproved(false);
        pendingLeave.setStartDate(LocalDateTime.of(2026, 3, 4, 8, 0));
        pendingLeave.setEndDate(LocalDateTime.of(2026, 3, 4, 17, 0));

        when(leaveRepository.findAll()).thenReturn(List.of(approvedLeave, pendingLeave));

        when(authenticationService.getCurrentUser()).thenReturn(account);

        LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

        // Approved = 1, Pending = 1
        assertEquals(1, summary.getApprovedCount());
        assertEquals(1, summary.getPendingCount());
        assertEquals(142, summary.getTotalDays());

    }

    @Test
    void testGetLeaveSummaryForCurrentUserNoAuthenticatedUser() {
        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                leaveService.getLeaveSummaryForCurrentUser()
        );
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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        // When the summary is calculated for the current user
        LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

        // Then only the hours for that partial leave should be deducted from the allowance
        assertEquals(1, summary.getApprovedCount());
        assertEquals(0, summary.getPendingCount());
        assertEquals(155, summary.getTotalDays());
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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        // When the summary is calculated for a leave crossing a weekend
        LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

        // Then Friday and Monday hours should count, but weekend days should be ignored
        assertEquals(1, summary.getApprovedCount());
        assertEquals(0, summary.getPendingCount());
        assertEquals(147, summary.getTotalDays());
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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        // When the summary is calculated for that invalid leave record
        LeaveSummaryResponse summary = leaveService.getLeaveSummaryForCurrentUser();

        // Then the leave should contribute zero used hours and not reduce the allowance
        assertEquals(1, summary.getApprovedCount());
        assertEquals(0, summary.getPendingCount());
        assertEquals(160, summary.getTotalDays());
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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        // When a new leave request is created
        leaveService.createLeave(request);

        // Then the leave should be saved to the repository
        verify(leaveRepository).save(any(LeaveTable.class));
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

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        // When the service attempts to create leave without an authenticated user
        assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the leave should not be saved
        verify(leaveRepository, never()).save(any(LeaveTable.class));
    }

    @Test
    void testCreateLeaveAuthenticatedAccountNotFound() {

        // Given a valid request and authenticated user id, but no matching account exists in the repository
        LeaveRequest request = buildValidLeaveRequest();

        when(leaveRepository.findLeaveForDate(any(), any())).thenReturn(List.of());
        when(accountRepository.findById(1L)).thenReturn(Optional.empty());

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        // When the service attempts to load the authenticated account
        assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the leave should not be saved because the account could not be found
        verify(leaveRepository, never()).save(any(LeaveTable.class));
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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        // When the service tries to resolve the leave type during creation
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.createLeave(request)
        );

        // Then the request should be rejected because the leave type id is invalid
        assertEquals("Invalid leave type id.", exception.getMessage());
    }

    @Test
    void testGetCalendarItemsSuccess() {

        // Given an approved leave spanning a Monday and Tuesday within the requested month
        AccountTable account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setName("Annual Leave");

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(LocalDateTime.of(2026, 4, 6, 8, 0));  // Monday
        leave.setEndDate(LocalDateTime.of(2026, 4, 7, 17, 0));   // Tuesday
        leave.setNotes("Spring break");

        when(leaveRepository.findApprovedLeaveInRange(any(), any())).thenReturn(List.of(leave));

        // When calendar items are requested for April 2026
        var result = leaveService.getCalendarItems(2026, 4);

        // Then one item per working day should be returned (Monday + Tuesday = 2)
        assertEquals(2, result.size());
        assertEquals("John Doe", result.getFirst().getEmployeeName());
        assertEquals("Annual Leave", result.getFirst().getLeaveType());
        assertEquals("Spring break", result.getFirst().getNotes());
    }

    @Test
    void testGetCalendarItemsSkipsWeekends() {

        // Given an approved leave spanning Friday through Monday (includes a weekend)
        AccountTable account = new AccountTable();
        account.setFirstName("Jane");
        account.setLastName("Smith");

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setName("sick leave");

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(LocalDateTime.of(2026, 4, 3, 8, 0));  // Friday
        leave.setEndDate(LocalDateTime.of(2026, 4, 6, 17, 0));   // Monday
        leave.setNotes(null);

        when(leaveRepository.findApprovedLeaveInRange(any(), any())).thenReturn(List.of(leave));

        // When calendar items are requested for April 2026
        var result = leaveService.getCalendarItems(2026, 4);

        // Then Saturday and Sunday should be excluded, leaving only Friday and Monday (2 items)
        assertEquals(2, result.size());
    }

    @Test
    void testGetCalendarItemsExcludesDaysOutsideRequestedMonth() {

        // Given an approved leave that starts in March and ends in April
        AccountTable account = new AccountTable();
        account.setFirstName("Bob");
        account.setLastName("Jones");

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setName("Training Leave");

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(LocalDateTime.of(2026, 3, 30, 8, 0));
        leave.setEndDate(LocalDateTime.of(2026, 4, 1, 17, 0));
        leave.setNotes(null);

        when(leaveRepository.findApprovedLeaveInRange(any(), any())).thenReturn(List.of(leave));

        // When calendar items are requested for April 2026 only
        var result = leaveService.getCalendarItems(2026, 4);

        // Then only the April day should be returned; the March days should be excluded
        assertEquals(1, result.size());
        assertEquals(LocalDate.of(2026, 4, 1), result.get(0).getDate());
    }

    @Test
    void testGetCalendarItemsPassesRawLeaveTypeName() {

        // Given leaves with each mapped leave type name
        AccountTable account = new AccountTable();
        account.setFirstName("Alice");
        account.setLastName("Brown");

        LocalDate monday = LocalDate.of(2026, 4, 6);

        String[] dbNames = { "Holiday", "Sick Leave", "Training Leave", "Emergency Leave" };

        List<LeaveTable> leaves = new java.util.ArrayList<>();
        for (int i = 0; i < dbNames.length; i++) {
            LeaveTypeTable lt = new LeaveTypeTable();
            lt.setName(dbNames[i]);
            LeaveTable leave = new LeaveTable();
            leave.setAccount(account);
            leave.setLeaveType(lt);
            leave.setStartDate(monday.plusDays(i).atTime(8, 0));
            leave.setEndDate(monday.plusDays(i).atTime(17, 0));
            leave.setNotes(null);
            leaves.add(leave);
        }

        when(leaveRepository.findApprovedLeaveInRange(any(), any())).thenReturn(leaves);

        var result = leaveService.getCalendarItems(2026, 4);

        assertEquals(4, result.size());
        for (int i = 0; i < dbNames.length; i++) {
            assertEquals(dbNames[i], result.get(i).getLeaveType());
        }
    }

    @Test
    void testGetCalendarItemsEmpty() {

        // Given no approved leave exists in the requested month
        when(leaveRepository.findApprovedLeaveInRange(any(), any())).thenReturn(List.of());

        // When calendar items are requested for April 2026
        var result = leaveService.getCalendarItems(2026, 4);

        // Then the result should be empty
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetPendingLeaveReturnsCorrectFields() {

        AccountTable account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setName("Holiday");

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(LocalDateTime.of(2026, 6, 1, 8, 0));
        leave.setEndDate(LocalDateTime.of(2026, 6, 5, 17, 0));
        leave.setNotes("Summer break");
        leave.setCreated(LocalDateTime.of(2026, 5, 1, 10, 0));

        when(leaveRepository.findPendingLeave()).thenReturn(List.of(leave));

        List<PendingLeaveResponse> result = leaveService.getPendingLeave();

        assertEquals(1, result.size());
        PendingLeaveResponse response = result.getFirst();
        assertEquals(1L, response.leaveId());
        assertEquals("John Doe", response.employeeName());
        assertEquals("Holiday", response.leaveType());
        assertEquals(leave.getStartDate(), response.startDate());
        assertEquals(leave.getEndDate(), response.endDate());
        assertEquals("Summer break", response.notes());
        assertEquals(leave.getCreated(), response.created());
    }

    @Test
    void testGetPendingLeaveReturnsEmptyList() {

        when(leaveRepository.findPendingLeave()).thenReturn(List.of());

        List<PendingLeaveResponse> result = leaveService.getPendingLeave();

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetPendingLeaveReturnsMultipleRequests() {

        AccountTable accountA = new AccountTable();
        accountA.setFirstName("Alice");
        accountA.setLastName("Blue");

        AccountTable accountB = new AccountTable();
        accountB.setFirstName("Bob");
        accountB.setLastName("Green");

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setName("Holiday");

        LeaveTable leaveA = new LeaveTable();
        leaveA.setLeaveId(1L);
        leaveA.setAccount(accountA);
        leaveA.setLeaveType(leaveType);
        leaveA.setStartDate(LocalDate.of(2026, 6, 1).atTime(8, 0));
        leaveA.setEndDate(LocalDate.of(2026, 6, 1).atTime(17, 0));
        leaveA.setCreated(LocalDateTime.of(2026, 5, 1, 9, 0));

        LeaveTable leaveB = new LeaveTable();
        leaveB.setLeaveId(2L);
        leaveB.setAccount(accountB);
        leaveB.setLeaveType(leaveType);
        leaveB.setStartDate(LocalDate.of(2026, 6, 2).atTime(8, 0));
        leaveB.setEndDate(LocalDate.of(2026, 6, 2).atTime(17, 0));
        leaveB.setCreated(LocalDateTime.of(2026, 5, 2, 9, 0));

        when(leaveRepository.findPendingLeave()).thenReturn(List.of(leaveA, leaveB));

        List<PendingLeaveResponse> result = leaveService.getPendingLeave();

        assertEquals(2, result.size());
        assertEquals("Alice Blue", result.get(0).employeeName());
        assertEquals("Bob Green", result.get(1).employeeName());
    }

    @Test
    void testApproveLeaveSuccess() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(false);
        leave.setResponse(null);

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        leaveService.approveLeave(1L, new LeaveDecisionRequest("Approved"));

        assertTrue(leave.isApproved());
        assertEquals("Approved", leave.getResponse());
        verify(leaveRepository).save(leave);
    }

    @Test
    void testApproveLeaveNotFound() {

        when(leaveRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.approveLeave(99L, new LeaveDecisionRequest("OK"))
        );

        assertEquals("Leave request not found.", exception.getMessage());
        verify(leaveRepository, never()).save(any());
    }

    @Test
    void testApproveLeaveAlreadyApproved() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(true);
        leave.setResponse(null);

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.approveLeave(1L, new LeaveDecisionRequest("OK"))
        );

        assertEquals("This leave request has already been approved.", exception.getMessage());
        verify(leaveRepository, never()).save(any());
    }

    @Test
    void testApproveLeaveAlreadyDeclined() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(false);
        leave.setResponse("Declined");

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.approveLeave(1L, new LeaveDecisionRequest("OK"))
        );

        assertEquals("This leave request has already been declined.", exception.getMessage());
        verify(leaveRepository, never()).save(any());
    }

    @Test
    void testDeclineLeaveSuccess() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(false);
        leave.setResponse(null);

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        leaveService.declineLeave(1L, new LeaveDecisionRequest("Too many absences"));

        assertFalse(leave.isApproved());
        assertEquals("Too many absences", leave.getResponse());
        verify(leaveRepository).save(leave);
    }

    @Test
    void testDeclineLeaveWithNullResponseDefaultsToDeclined() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(false);
        leave.setResponse(null);

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        leaveService.declineLeave(1L, new LeaveDecisionRequest(null));

        assertFalse(leave.isApproved());
        assertEquals("Declined", leave.getResponse());
        verify(leaveRepository).save(leave);
    }

    @Test
    void testDeclineLeaveNotFound() {

        when(leaveRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.declineLeave(99L, new LeaveDecisionRequest("No"))
        );

        assertEquals("Leave request not found.", exception.getMessage());
        verify(leaveRepository, never()).save(any());
    }

    @Test
    void testDeclineLeaveAlreadyApproved() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(true);
        leave.setResponse(null);

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.declineLeave(1L, new LeaveDecisionRequest("No"))
        );

        assertEquals("This leave request has already been approved.", exception.getMessage());
        verify(leaveRepository, never()).save(any());
    }

    @Test
    void testDeclineLeaveAlreadyDeclined() {

        LeaveTable leave = new LeaveTable();
        leave.setLeaveId(1L);
        leave.setApproved(false);
        leave.setResponse("Already declined");

        when(leaveRepository.findById(1L)).thenReturn(Optional.of(leave));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                leaveService.declineLeave(1L, new LeaveDecisionRequest("No"))
        );

        assertEquals("This leave request has already been declined.", exception.getMessage());
        verify(leaveRepository, never()).save(any());
    }
}