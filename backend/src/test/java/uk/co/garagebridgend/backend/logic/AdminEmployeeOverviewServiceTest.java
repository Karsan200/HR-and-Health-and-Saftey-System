package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.request.AdminCreateEmployeeRequest;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeListItemResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeOverviewResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import org.junit.jupiter.params.provider.Arguments;
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

    @Mock
    private AuthenticationService authenticationService;

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
        validClockInOne.setClockInTime(LocalTime.of(8, 0));
        validClockInOne.setClockOutTime(LocalTime.of(12, 15));

        ClockInTable validClockInTwo = new ClockInTable();
        validClockInTwo.setClockInTime(LocalTime.of(13, 0));
        validClockInTwo.setClockOutTime(LocalTime.of(17, 0));

        ClockInTable missingClockOut = new ClockInTable();
        missingClockOut.setClockInTime(LocalTime.of(8, 0));
        missingClockOut.setClockOutTime(null);

        ClockInTable endBeforeStart = new ClockInTable();
        endBeforeStart.setClockInTime(LocalTime.of(17, 0));
        endBeforeStart.setClockOutTime(LocalTime.of(8, 0));

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
        sameStartAndEnd.setClockInTime(LocalTime.of(8, 0));
        sameStartAndEnd.setClockOutTime(LocalTime.of(8, 0));

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

    @Test
    void testCreateEmployeeSuccessAdminCreatingAdmin() {

        // Given an authenticated admin creates another admin with valid sanitised data
        AccountTable creator = new AccountTable();
        creator.setAccountId(1L);

        AdminCreateEmployeeRequest request = new AdminCreateEmployeeRequest(
                "  Craig  ",
                "  O'Neil  ",
                "  CRAIG.TEST@EXAMPLE.COM  ",
                " +44 (7700) 900-123 ",
                "  1   Test Street  ",
                "  Building   A  ",
                "  cf31  1aa ",
                "  admin ",
                "  craig.oneil  ",
                "Password123"
        );

        when(authenticationService.getCurrentUser()).thenReturn(creator);
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));
        when(accountRepository.findByEmailIgnoreCase("craig.test@example.com")).thenReturn(Optional.empty());
        when(accountRepository.findByUsernameIgnoreCase("craig.oneil")).thenReturn(Optional.empty());
        when(accountRepository.save(any(AccountTable.class))).thenAnswer(invocation -> {
            AccountTable saved = invocation.getArgument(0);
            saved.setAccountId(50L);
            return saved;
        });

        // When the new employee is created
        AdminEmployeeListItemResponse result = adminEmployeeOverviewService.createEmployee(request);

        // Then the account and permissions should be saved with the expected values
        assertEquals(50L, result.getAccountId());
        assertEquals("Craig O'Neil", result.getFullName());
        assertEquals("Admin", result.getPosition());

        ArgumentCaptor<AccountTable> accountCaptor = ArgumentCaptor.forClass(AccountTable.class);
        verify(accountRepository).save(accountCaptor.capture());

        AccountTable savedAccount = accountCaptor.getValue();
        assertEquals("Craig", savedAccount.getFirstName());
        assertEquals("O'Neil", savedAccount.getLastName());
        assertEquals("craig.test@example.com", savedAccount.getEmail());
        assertEquals("+447700900123", savedAccount.getPhoneNumber());
        assertNull(savedAccount.getRegionCode());
        assertEquals("1 Test Street", savedAccount.getAddressOne());
        assertEquals("Building A", savedAccount.getAddressTwo());
        assertEquals("CF31 1AA", savedAccount.getPostalCode());
        assertEquals("craig.oneil", savedAccount.getUsername());
        assertNotEquals("Password123", savedAccount.getPassword());
        assertTrue(BCrypt.checkpw("Password123", savedAccount.getPassword()));

        ArgumentCaptor<PermissionsTable> permissionsCaptor = ArgumentCaptor.forClass(PermissionsTable.class);
        verify(permissionsRepository).save(permissionsCaptor.capture());

        PermissionsTable savedPermissions = permissionsCaptor.getValue();
        assertEquals(savedAccount, savedPermissions.getAccount());
        assertEquals(creator, savedPermissions.getAssignedByAccount());
        assertTrue(savedPermissions.isAdmin());
        assertFalse(savedPermissions.isManager());
    }

    @Test
    void testCreateEmployeeSuccessManagerCreatingManager() {

        // Given an authenticated manager creates a manager and blank optional address line two is supplied
        AccountTable creator = new AccountTable();
        creator.setAccountId(2L);

        AdminCreateEmployeeRequest request = new AdminCreateEmployeeRequest(
                "Maggie",
                "May",
                "maggie@example.com",
                "07700900123",
                "2 Test Street",
                "   ",
                "CF31 2BB",
                "manager",
                "maggie.may",
                "Password123"
        );

        when(authenticationService.getCurrentUser()).thenReturn(creator);
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_MANAGER"));
        when(accountRepository.findByEmailIgnoreCase("maggie@example.com")).thenReturn(Optional.empty());
        when(accountRepository.findByUsernameIgnoreCase("maggie.may")).thenReturn(Optional.empty());
        when(accountRepository.save(any(AccountTable.class))).thenAnswer(invocation -> {
            AccountTable saved = invocation.getArgument(0);
            saved.setAccountId(51L);
            return saved;
        });

        // When the new employee is created
        AdminEmployeeListItemResponse result = adminEmployeeOverviewService.createEmployee(request);

        // Then the manager should be created and line two should be normalised to null
        assertEquals(51L, result.getAccountId());
        assertEquals("Maggie May", result.getFullName());
        assertEquals("Manager", result.getPosition());

        ArgumentCaptor<AccountTable> accountCaptor = ArgumentCaptor.forClass(AccountTable.class);
        verify(accountRepository).save(accountCaptor.capture());
        assertNull(accountCaptor.getValue().getAddressTwo());

        ArgumentCaptor<PermissionsTable> permissionsCaptor = ArgumentCaptor.forClass(PermissionsTable.class);
        verify(permissionsRepository).save(permissionsCaptor.capture());

        PermissionsTable savedPermissions = permissionsCaptor.getValue();
        assertFalse(savedPermissions.isAdmin());
        assertTrue(savedPermissions.isManager());
    }

    @Test
    void testCreateEmployeeSuccessManagerCreatingEmployee() {

        // Given an authenticated manager creates a standard employee
        AccountTable creator = new AccountTable();
        creator.setAccountId(3L);

        AdminCreateEmployeeRequest request = new AdminCreateEmployeeRequest(
                "Jane",
                "Smith",
                "jane@example.com",
                "07700900124",
                "3 Test Street",
                null,
                "CF31 3CC",
                "employee",
                "jane.smith",
                "Password123"
        );

        when(authenticationService.getCurrentUser()).thenReturn(creator);
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_MANAGER"));
        when(accountRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.empty());
        when(accountRepository.findByUsernameIgnoreCase("jane.smith")).thenReturn(Optional.empty());
        when(accountRepository.save(any(AccountTable.class))).thenAnswer(invocation -> {
            AccountTable saved = invocation.getArgument(0);
            saved.setAccountId(52L);
            return saved;
        });

        // When the new employee is created
        AdminEmployeeListItemResponse result = adminEmployeeOverviewService.createEmployee(request);

        // Then the employee should be created with no admin or manager permissions
        assertEquals(52L, result.getAccountId());
        assertEquals("Employee", result.getPosition());

        ArgumentCaptor<PermissionsTable> permissionsCaptor = ArgumentCaptor.forClass(PermissionsTable.class);
        verify(permissionsRepository).save(permissionsCaptor.capture());

        PermissionsTable savedPermissions = permissionsCaptor.getValue();
        assertFalse(savedPermissions.isAdmin());
        assertFalse(savedPermissions.isManager());
    }

    @Test
    void testCreateEmployeeThrowsWhenCurrentUserNotAuthenticated() {

        // Given employee creation is attempted without an authenticated user
        AdminCreateEmployeeRequest request = buildValidRequest();

        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When the service attempts to create the employee
        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then nothing should be saved
        verify(accountRepository, never()).save(any());
        verify(permissionsRepository, never()).save(any());
    }

    @Test
    void testCreateEmployeeEmailAlreadyInUse() {

        // Given the email already exists
        AdminCreateEmployeeRequest request = buildValidRequest();

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));
        when(accountRepository.findByEmailIgnoreCase("john@example.com"))
                .thenReturn(Optional.of(new AccountTable()));

        // When the service checks email uniqueness
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals("Email address is already in use.", exception.getMessage());
    }

    @Test
    void testCreateEmployeeUsernameAlreadyTaken() {

        // Given the username already exists
        AdminCreateEmployeeRequest request = buildValidRequest();

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));
        when(accountRepository.findByEmailIgnoreCase("john@example.com")).thenReturn(Optional.empty());
        when(accountRepository.findByUsernameIgnoreCase("john.smith"))
                .thenReturn(Optional.of(new AccountTable()));

        // When the service checks username uniqueness
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals("Username is already taken.", exception.getMessage());
    }

    @Test
    void testCreateEmployeeWithoutRequiredRoleThrowsSecurityException() {

        // Given the current user is neither an admin nor a manager
        AdminCreateEmployeeRequest request = buildValidRequest();

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_USER"));

        // When the service checks permissions for employee creation
        SecurityException exception = assertThrows(
                SecurityException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the request should be rejected
        assertEquals("You do not have permission to add employees.", exception.getMessage());
    }

    @Test
    void testCreateEmployeeManagerCannotCreateAdmin() {

        // Given a manager attempts to create an admin account
        AdminCreateEmployeeRequest request = buildValidRequest();
        request.setPosition("Admin");

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_MANAGER"));

        // When the service checks permissions for admin creation
        SecurityException exception = assertThrows(
                SecurityException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the request should be rejected
        assertEquals(
                "Only admins can give admin permissions to a new account.",
                exception.getMessage()
        );
    }

    @ParameterizedTest
    @MethodSource("requiredTextValidationCases")
    void testCreateEmployeeRequiredTextValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with one required text field made invalid
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the request
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("emailValidationCases")
    void testCreateEmployeeEmailValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with an invalid email field
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the email
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("phoneValidationCases")
    void testCreateEmployeePhoneValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with an invalid phone number
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the phone number
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("postalCodeValidationCases")
    void testCreateEmployeePostalCodeValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with an invalid postal code
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the postal code
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("positionValidationCases")
    void testCreateEmployeePositionValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with an invalid position
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the position
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("namePatternValidationCases")
    void testCreateEmployeeNamePatternValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with an invalid name pattern
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the name field
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("usernameValidationCases")
    void testCreateEmployeeUsernameValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // Only needed once username sanitisation succeeds
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            when(accountRepository.findByEmailIgnoreCase("john@example.com"))
                    .thenReturn(Optional.empty());
        }

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        assertEquals(expectedMessage, exception.getMessage());
    }

    @ParameterizedTest
    @MethodSource("passwordValidationCases")
    void testCreateEmployeePasswordValidation(
            Consumer<AdminCreateEmployeeRequest> mutator,
            String expectedMessage
    ) {

        // Given a valid employee creation request with an invalid password
        AdminCreateEmployeeRequest request = buildValidRequest();
        mutator.accept(request);

        when(authenticationService.getCurrentUser()).thenReturn(new AccountTable());
        when(authenticationService.getCurrentClaims()).thenReturn(List.of("ROLE_ADMIN"));

        // When the service validates the password
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminEmployeeOverviewService.createEmployee(request)
        );

        // Then the expected validation message should be returned
        assertEquals(expectedMessage, exception.getMessage());
    }

    private AdminCreateEmployeeRequest buildValidRequest() {
        return new AdminCreateEmployeeRequest(
                "John",
                "Smith",
                "john@example.com",
                "07700900123",
                "1 Test Street",
                null,
                "CF31 1AA",
                "Employee",
                "john.smith",
                "Password123"
        );
    }

    // Learnt how to use parameterised tests with mutators to test multiple validation from the following resources:
    // https://www.baeldung.com/parameterized-tests-junit-5
    // https://coderpad.io/blog/development/writing-a-parameterized-test-in-junit-with-examples/


    private static Stream<Arguments> requiredTextValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setFirstName(null),
                        "First name is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setSurname("   "),
                        "Surname is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setAddressOne("   "),
                        "Address line one is required."
                )
        );
    }

    // Mutators to ensure the email is validated
    private static Stream<Arguments> emailValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setEmail(null),
                        "Email is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setEmail("   "),
                        "Email cannot be blank."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setEmail("not-an-email"),
                        "Email address is not valid."
                )
        );
    }

    // Mutators to ensure the phone number is validated
    private static Stream<Arguments> phoneValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPhoneNumber(null),
                        "Phone number is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPhoneNumber("07--$2#'ABC123"),
                        "Phone number contains invalid characters."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPhoneNumber("    "),
                        "Phone number contains invalid characters."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPhoneNumber("+12345678901234567"),
                        "Phone number is too long."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPhoneNumber("1234567"),
                        "Phone number does not contain enough valid numbers."
                )
        );
    }

    // Mutators for postal code validation, ensuring that null, blank, too long and invalid character postal codes are rejected with the expected messages
    private static Stream<Arguments> postalCodeValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPostalCode(null),
                        "Postal code is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPostalCode("   "),
                        "Postal code is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPostalCode("ABCDEFGH1"),
                        "Postal code is too long."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPostalCode("CF31$1AA"),
                        "Postal code contains invalid characters."
                )
        );
    }

    // Ensuring the position is validated
    private static Stream<Arguments> positionValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPosition("   "),
                        "Position is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPosition("director"),
                        "Position must be either an Employee, Manager, or Admin."
                )
        );
    }

    // Mutators for name pattern validation, ensuring that invalid characters in names are rejected with the expected messages
    private static Stream<Arguments> namePatternValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setFirstName("John123"),
                        "First name may only contain letters, spaces, apostrophes, and hyphens."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setSurname("Smith!"),
                        "Surname may only contain letters, spaces, apostrophes, and hyphens."
                )
        );
    }

    // Mutators for username validation, ensuring that they meet username requirements
    private static Stream<Arguments> usernameValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setUsername(null),
                        "Username is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setUsername("   "),
                        "Username cannot be blank."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setUsername("ab"),
                        "Username must be between 3 and 32 characters."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request ->
                                request.setUsername("abcdefghijklmnopqrstuvwxyz1234567"),
                        "Username must be between 3 and 32 characters."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setUsername("john smith"),
                        "Username may only contain letters, numbers, dots, underscores, and hyphens."
                )
        );
    }

    // Mutators for password validation, ensuring that null, blank and too short passwords are rejected with the expected messages
    private static Stream<Arguments> passwordValidationCases() {
        return Stream.of(
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPassword(null),
                        "Password is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPassword("   "),
                        "Password is required."
                ),
                arguments(
                        (Consumer<AdminCreateEmployeeRequest>) request -> request.setPassword("short"),
                        "Password must be at least 8 characters."
                )
        );
    }
}
