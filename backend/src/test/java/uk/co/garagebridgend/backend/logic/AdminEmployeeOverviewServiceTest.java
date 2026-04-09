package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeListItemResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeOverviewResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;

import java.sql.Time;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class AdminEmployeeOverviewServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PermissionsRepository permissionsRepository;

    @Mock
    private ClockInRepository clockInRepository;

    @Mock
    private LeaveRepository leaveRepository;

    @InjectMocks
    private AdminEmployeeOverviewService adminEmployeeOverviewService;

    @Test
    void testGetEmployeesUsesFindAllWhenSearchIsNull() {

        // Given two employee accounts and different permissions
        AccountTable adminAccount = new AccountTable();
        adminAccount.setAccountId(1L);
        adminAccount.setFirstName("John");
        adminAccount.setLastName("Doe");

        AccountTable managerAccount = new AccountTable();
        managerAccount.setAccountId(2L);
        managerAccount.setFirstName("Jane");
        managerAccount.setLastName("Smith");

        PermissionsTable adminPermissions = new PermissionsTable();
        adminPermissions.setAdmin(true);
        adminPermissions.setManager(false);

        PermissionsTable managerPermissions = new PermissionsTable();
        managerPermissions.setAdmin(false);
        managerPermissions.setManager(true);

        when(accountRepository.findAllByOrderByFirstNameAscLastNameAsc())
                .thenReturn(List.of(adminAccount, managerAccount));
        when(permissionsRepository.findById(1L)).thenReturn(Optional.of(adminPermissions));
        when(permissionsRepository.findById(2L)).thenReturn(Optional.of(managerPermissions));

        // When employees are requested with a null search
        List<AdminEmployeeListItemResponse> result =
                adminEmployeeOverviewService.getEmployees(null);

        // Then all employees should be returned using full names and mapped positions
        assertEquals(2, result.size());
        assertEquals(1L, result.getFirst().getAccountId());
        assertEquals("John Doe", result.get(0).getFullName());
        assertEquals("Admin", result.get(0).getPosition());
        assertEquals(2L, result.get(1).getAccountId());
        assertEquals("Jane Smith", result.get(1).getFullName());
        assertEquals("Manager", result.get(1).getPosition());

        verify(accountRepository).findAllByOrderByFirstNameAscLastNameAsc();
        verify(accountRepository, never()).searchForEmployeeOverview(anyString());
    }

    @Test
    void testGetEmployeesUsesFindAllWhenSearchIsBlank() {

        // Given one employee account and no permissions record
        AccountTable employeeAccount = new AccountTable();
        employeeAccount.setAccountId(3L);
        employeeAccount.setFirstName("Alice");
        employeeAccount.setLastName("Brown");

        when(accountRepository.findAllByOrderByFirstNameAscLastNameAsc())
                .thenReturn(List.of(employeeAccount));
        when(permissionsRepository.findById(3L)).thenReturn(Optional.empty());

        // When employees are requested with blank search text
        List<AdminEmployeeListItemResponse> result =
                adminEmployeeOverviewService.getEmployees("   ");

        // Then the service should return all employees and default the position to Employee
        assertEquals(1, result.size());
        assertEquals(3L, result.getFirst().getAccountId());
        assertEquals("Alice Brown", result.getFirst().getFullName());
        assertEquals("Employee", result.getFirst().getPosition());

        verify(accountRepository).findAllByOrderByFirstNameAscLastNameAsc();
        verify(accountRepository, never()).searchForEmployeeOverview(anyString());
    }

    @Test
    void testGetEmployeesUsesTrimmedSearchWhenProvided() {

        // Given one matching account with manager false and admin false
        AccountTable employeeAccount = new AccountTable();
        employeeAccount.setAccountId(4L);
        employeeAccount.setFirstName("Craig");
        employeeAccount.setLastName("Sheppard");

        PermissionsTable employeePermissions = new PermissionsTable();
        employeePermissions.setAdmin(false);
        employeePermissions.setManager(false);

        when(accountRepository.searchForEmployeeOverview("Craig"))
                .thenReturn(List.of(employeeAccount));
        when(permissionsRepository.findById(4L)).thenReturn(Optional.of(employeePermissions));

        // When employees are requested with a search value that needs trimming
        List<AdminEmployeeListItemResponse> result =
                adminEmployeeOverviewService.getEmployees("  Craig  ");

        // Then the trimmed search should be used and the mapped employee should be returned
        assertEquals(1, result.size());
        assertEquals(4L, result.getFirst().getAccountId());
        assertEquals("Craig Sheppard", result.getFirst().getFullName());
        assertEquals("Employee", result.getFirst().getPosition());

        verify(accountRepository).searchForEmployeeOverview("Craig");
        verify(accountRepository, never()).findAllByOrderByFirstNameAscLastNameAsc();
    }

    @Test
    void testGetEmployeeOverviewSuccessWithUpcomingLeaveAndHoursFiltering() {

        // Given an employee exists with manager permissions, clock-ins and an upcoming approved leave
        AccountTable account = new AccountTable();
        account.setAccountId(10L);
        account.setFirstName("Charlie");
        account.setLastName("Johnson");
        account.setEmail("charlie@test.com");

        PermissionsTable permissions = new PermissionsTable();
        permissions.setAdmin(false);
        permissions.setManager(true);

        ClockInTable validClockInOne = new ClockInTable();
        validClockInOne.setClockInTime(Time.valueOf("08:00:00"));
        validClockInOne.setClockOutTime(Time.valueOf("12:15:00"));

        ClockInTable validClockInTwo = new ClockInTable();
        validClockInTwo.setClockInTime(Time.valueOf("13:00:00"));
        validClockInTwo.setClockOutTime(Time.valueOf("17:00:00"));

        ClockInTable missingClockOut = new ClockInTable();
        missingClockOut.setClockInTime(Time.valueOf("08:00:00"));
        missingClockOut.setClockOutTime(null);

        ClockInTable endBeforeStart = new ClockInTable();
        endBeforeStart.setClockInTime(Time.valueOf("17:00:00"));
        endBeforeStart.setClockOutTime(Time.valueOf("08:00:00"));

        LeaveTypeTable leaveType = new LeaveTypeTable();
        leaveType.setName("Annual Leave");

        LeaveTable upcomingLeave = new LeaveTable();
        upcomingLeave.setLeaveType(leaveType);
        upcomingLeave.setStartDate(LocalDateTime.now().plusDays(5).withHour(8).withMinute(0));
        upcomingLeave.setEndDate(LocalDateTime.now().plusDays(6).withHour(17).withMinute(0));

        when(accountRepository.findById(10L)).thenReturn(Optional.of(account));
        when(permissionsRepository.findById(10L)).thenReturn(Optional.of(permissions));
        when(clockInRepository.findAllForEmployeeWithinDateRange(eq(10L), any(), any()))
                .thenReturn(List.of(validClockInOne, validClockInTwo, missingClockOut, endBeforeStart));
        when(clockInRepository.countLateClockInsForEmployeeWithinDateRange(eq(10L), any(), any(), any()))
                .thenReturn(3);
        when(leaveRepository.findUpcomingApprovedLeaveForEmployee(eq(10L), any()))
                .thenReturn(List.of(upcomingLeave));

        // When the employee overview is requested
        AdminEmployeeOverviewResponse result =
                adminEmployeeOverviewService.getEmployeeOverview(10L);

        // Then the employee overview should contain the mapped details, rounded hours and upcoming leave
        assertEquals(10L, result.getAccountId());
        assertEquals("Charlie Johnson", result.getFullName());
        assertEquals("Manager", result.getPosition());
        assertEquals("charlie@test.com", result.getEmail());
        assertEquals(8.3, result.getHoursWorkedThisMonth());
        assertEquals(3, result.getLatesThisMonth());
        assertNotNull(result.getUpcomingLeave());
        assertEquals("Annual Leave", result.getUpcomingLeave().getLeaveType());
        assertEquals(upcomingLeave.getStartDate(), result.getUpcomingLeave().getStartDate());
        assertEquals(upcomingLeave.getEndDate(), result.getUpcomingLeave().getEndDate());
    }

    @Test
    void testGetEmployeeOverviewSuccessWithoutUpcomingLeaveAndDefaultPosition() {

        // Given an employee exists with no permissions record, no valid worked hours and no upcoming leave
        AccountTable account = new AccountTable();
        account.setAccountId(11L);
        account.setFirstName("Daisy");
        account.setLastName("Miller");
        account.setEmail("daisy@test.com");

        ClockInTable nullTimes = new ClockInTable();
        nullTimes.setClockInTime(null);
        nullTimes.setClockOutTime(null);

        ClockInTable sameStartAndEnd = new ClockInTable();
        sameStartAndEnd.setClockInTime(Time.valueOf("08:00:00"));
        sameStartAndEnd.setClockOutTime(Time.valueOf("08:00:00"));

        when(accountRepository.findById(11L)).thenReturn(Optional.of(account));
        when(permissionsRepository.findById(11L)).thenReturn(Optional.empty());
        when(clockInRepository.findAllForEmployeeWithinDateRange(eq(11L), any(), any()))
                .thenReturn(List.of(nullTimes, sameStartAndEnd));
        when(clockInRepository.countLateClockInsForEmployeeWithinDateRange(eq(11L), any(), any(), any()))
                .thenReturn(0);
        when(leaveRepository.findUpcomingApprovedLeaveForEmployee(eq(11L), any()))
                .thenReturn(List.of());

        // When the employee overview is requested
        AdminEmployeeOverviewResponse result =
                adminEmployeeOverviewService.getEmployeeOverview(11L);

        // Then hours should be zero, the default position should be Employee and upcoming leave should be null
        assertEquals(11L, result.getAccountId());
        assertEquals("Daisy Miller", result.getFullName());
        assertEquals("Employee", result.getPosition());
        assertEquals("daisy@test.com", result.getEmail());
        assertEquals(0.0, result.getHoursWorkedThisMonth());
        assertEquals(0, result.getLatesThisMonth());
        assertNull(result.getUpcomingLeave());
    }

    @Test
    void testGetEmployeeOverviewAdminPosition() {

        // Given an employee exists with admin permissions
        AccountTable account = new AccountTable();
        account.setAccountId(12L);
        account.setFirstName("Edward");
        account.setLastName("Taylor");
        account.setEmail("edward@test.com");

        PermissionsTable permissions = new PermissionsTable();
        permissions.setAdmin(true);
        permissions.setManager(true);

        when(accountRepository.findById(12L)).thenReturn(Optional.of(account));
        when(permissionsRepository.findById(12L)).thenReturn(Optional.of(permissions));
        when(clockInRepository.findAllForEmployeeWithinDateRange(eq(12L), any(), any()))
                .thenReturn(List.of());
        when(clockInRepository.countLateClockInsForEmployeeWithinDateRange(eq(12L), any(), any(), any()))
                .thenReturn(1);
        when(leaveRepository.findUpcomingApprovedLeaveForEmployee(eq(12L), any()))
                .thenReturn(List.of());

        // When the employee overview is requested
        AdminEmployeeOverviewResponse result =
                adminEmployeeOverviewService.getEmployeeOverview(12L);

        // Then admin should take precedence when mapping the position label
        assertEquals("Admin", result.getPosition());
        assertEquals(0.0, result.getHoursWorkedThisMonth());
        assertEquals(1, result.getLatesThisMonth());
    }

    @Test
    void testGetEmployeeOverviewNotFound() {

        // Given the requested employee does not exist
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        // When the employee overview is requested
        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> adminEmployeeOverviewService.getEmployeeOverview(99L)
        );

        // Then the service should throw the expected not found exception
        assertEquals("Employee not found.", exception.getMessage());
    }
}
