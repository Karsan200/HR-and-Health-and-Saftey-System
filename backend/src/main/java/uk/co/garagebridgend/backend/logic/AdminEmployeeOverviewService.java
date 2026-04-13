package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeListItemResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeOverviewResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeUpcomingLeaveResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.AdminCreateEmployeeRequest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service responsible for admin employee overview logic.
 * This includes returning the employee's, employee search, and
 * details about a specific employee.
 */
@Service
@RequiredArgsConstructor
public class AdminEmployeeOverviewService {

    /** Time after which a clock-in is considered late. */
    private static final LocalTime LATE_THRESHOLD = LocalTime.of(8, 0);

    /** Number of minutes in an hour, used for hours calculation. */
    private static final double MINUTES_IN_HOUR = 60.0;

    /** Number used to round hours worked to one decimal place. */
    private static final double HOURS_ROUNDING_FACTOR = 10.0;

    /** Minimum password length. */
    private static final int MIN_PASSWORD_LENGTH = 8;

    /** Maximum phone number length after sanitisation. */
    private static final int MAX_PHONE_NUMBER_LENGTH = 17;

    /** Maximum username length. */
    private static final int MAX_USERNAME_LENGTH = 32;

    /** Minimum username length. */
    private static final int MIN_USERNAME_LENGTH = 3;

    /** Maximum postal code length. */
    private static final int MAX_POSTAL_CODE_LENGTH = 8;

    /** Validation pattern for names. */
    private static final Pattern NAME_PATTERN = Pattern.compile("^[A-Za-zÀ-ÿ' -]+$");

    /** Validation pattern for email addresses. */
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);

    /** Validation pattern for usernames. */
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9._-]+$");

    /** Validation pattern for phone input before sanitisation. */
    private static final Pattern PHONE_INPUT_PATTERN = Pattern.compile("^[0-9+()\\-\\s]+$");

    /** Validation pattern for postal code input. */
    private static final Pattern POSTAL_CODE_PATTERN = Pattern.compile("^[A-Za-z0-9 ]+$");

    /** Repository for account data. */
    private final AccountRepository accountRepository;

    /** Repository for permission data. */
    private final PermissionsRepository permissionsRepository;

    /** Repository for clock-in data. */
    private final ClockInRepository clockInRepository;

    /** Repository for leave data. */
    private final LeaveRepository leaveRepository;

    /** Service for retrieving the authenticated user and claims. */
    private final AuthenticationService authenticationService;

    /**
     * Retrieves all employees for the overview list, optionally filtered by search text.
     *
     * @param search optional search text
     * @return a list of employee list items
     */
    public List<AdminEmployeeListItemResponse> getEmployees(final String search) {
        List<AccountTable> accounts;

        if (search == null || search.isBlank()) {
            accounts = accountRepository.findAllByOrderByFirstNameAscLastNameAsc();
        } else {
            accounts = accountRepository.searchForEmployeeOverview(search.trim());
        }

        return accounts.stream()
                .map(account -> new AdminEmployeeListItemResponse(
                        account.getAccountId(),
                        buildFullName(account),
                        getPositionLabel(account.getAccountId())
                ))
                .toList();
    }

    /**
     * Retrieves the overview information for a single employee.
     *
     * @param accountId the employee account id
     * @return the employee overview response
     * @throws NotFoundException if the employee does not exist
     */
    public AdminEmployeeOverviewResponse getEmployeeOverview(final Long accountId)
            throws NotFoundException {
        AccountTable account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Employee not found."));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = today.withDayOfMonth(1).plusMonths(1).atStartOfDay();

        double hoursWorkedThisMonth = calculateHoursWorkedThisMonth(
                accountId,
                startOfMonth,
                startOfNextMonth
        );

        int latesThisMonth = clockInRepository.countLateClockInsForEmployeeWithinDateRange(
                accountId,
                LATE_THRESHOLD,
                startOfMonth,
                startOfNextMonth
        );

        AdminEmployeeUpcomingLeaveResponse upcomingLeave = getUpcomingLeave(accountId);

        return new AdminEmployeeOverviewResponse(
                account.getAccountId(),
                buildFullName(account),
                getPositionLabel(account.getAccountId()),
                account.getEmail(),
                hoursWorkedThisMonth,
                latesThisMonth,
                upcomingLeave
        );
    }

    /**
     * Calculates the number of hours worked in the current month for an employee.
     *
     * @param accountId the employee account id
     * @param startOfMonth inclusive start of the month
     * @param startOfNextMonth exclusive start of next month
     * @return the total number of hours worked, rounded to one decimal place
     */
    private double calculateHoursWorkedThisMonth(
            final Long accountId,
            final LocalDateTime startOfMonth,
            final LocalDateTime startOfNextMonth
    ) {
        List<ClockInTable> clockIns = clockInRepository.findAllForEmployeeWithinDateRange(
                accountId,
                startOfMonth,
                startOfNextMonth
        );

        double totalHours = 0.0;

        for (ClockInTable clockIn : clockIns) {
            if (clockIn.getClockInTime() == null || clockIn.getClockOutTime() == null) {
                continue;
            }

            LocalTime startTime = clockIn.getClockInTime();
            LocalTime endTime = clockIn.getClockOutTime();

            if (!endTime.isAfter(startTime)) {
                continue;
            }

            long minutesWorked = Duration.between(startTime, endTime).toMinutes();
            totalHours += minutesWorked / MINUTES_IN_HOUR;
        }

        return Math.round(totalHours * HOURS_ROUNDING_FACTOR) / HOURS_ROUNDING_FACTOR;
    }

    /**
     * Retrieves the next upcoming approved leave booking for an employee.
     *
     * @param accountId the employee account id
     * @return the upcoming leave response, or null if none exists
     */
    private AdminEmployeeUpcomingLeaveResponse getUpcomingLeave(final Long accountId) {
        return leaveRepository.findUpcomingApprovedLeaveForEmployee(accountId, LocalDateTime.now())
                .stream()
                .findFirst()
                .map(leave -> new AdminEmployeeUpcomingLeaveResponse(
                        leave.getLeaveType().getName(),
                        leave.getStartDate(),
                        leave.getEndDate()
                ))
                .orElse(null);
    }

    /**
     * Builds the employee display name from first and last name.
     *
     * @param account the account entity
     * @return the employee full name
     */
    private String buildFullName(final AccountTable account) {
        return account.getFirstName() + " " + account.getLastName();
    }

    /**
     * Resolves the employee position label from their permissions.
     *
     * @param accountId the employee account id
     * @return Admin, Manager, or Employee
     */
    private String getPositionLabel(final Long accountId) {
        return permissionsRepository.findById(accountId)
                .map(this::mapPositionFromPermissions)
                .orElse("Employee");
    }

    /**
     * Maps a permissions record to a display position label.
     *
     * @param permissions the permissions record
     * @return a display label for the employee position
     */
    private String mapPositionFromPermissions(final PermissionsTable permissions) {
        if (permissions.isAdmin()) {
            return "Admin";
        }

        if (permissions.isManager()) {
            return "Manager";
        }

        return "Employee";
    }

    /**
     * Creates a new employee account, when the submitted form is received.
     *
     * @param request the employee creation request
     * @return list item response for the created employee
     * @throws AuthenticatedAccountNotFoundException if the creator is not authenticated
     * @throws IllegalArgumentException if validation fails
     * @throws SecurityException if the current user is not allowed to create the requested position
     */
    @Transactional
    public AdminEmployeeListItemResponse createEmployee(final AdminCreateEmployeeRequest request)
            throws AuthenticatedAccountNotFoundException {

        AccountTable creator = authenticationService.getCurrentUser();
        List<String> claims = authenticationService.getCurrentClaims();

        String firstName = sanitiseText(request.getFirstName(), "First name");
        String surname = sanitiseText(request.getSurname(), "Surname");
        String email = sanitiseEmail(request.getEmail());
        String phoneNumber = sanitisePhoneNumber(request.getPhoneNumber());
        String addressOne = sanitiseText(request.getAddressOne(), "Address line one");
        String addressTwo = sanitiseOptionalText(request.getAddressTwo());
        String postalCode = sanitisePostalCode(request.getPostalCode());
        String position = normalisePosition(request.getPosition());
        String username = sanitiseUsername(request.getUsername());
        String password = validatePassword(request.getPassword());

        validateCreatePermission(position, claims);
        validateName(firstName, "First name");
        validateName(surname, "Surname");

        // Ensures email meets requirements
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Email address is not valid.");
        }

        if (accountRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("Email address is already in use.");
        }

        // Ensures username meets requirements
        if (username.length() < MIN_USERNAME_LENGTH || username.length() > MAX_USERNAME_LENGTH) {
            throw new IllegalArgumentException("Username must be between 3 and 32 characters.");
        }

        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException(
                    "Username may only contain letters, numbers, dots, underscores, and hyphens."
            );
        }

        if (accountRepository.findByUsernameIgnoreCase(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        AccountTable account = new AccountTable();
        account.setFirstName(firstName);
        account.setLastName(surname);
        account.setEmail(email);
        account.setPhoneNumber(phoneNumber);
        account.setRegionCode(null);
        account.setAddressOne(addressOne);
        account.setAddressTwo(addressTwo);
        account.setPostalCode(postalCode);
        account.setUsername(username);
        account.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));

        AccountTable savedAccount = accountRepository.save(account);

        PermissionsTable permissions = new PermissionsTable();
        permissions.setAccount(savedAccount);
        permissions.setAssignedByAccount(creator);
        permissions.setAdmin("Admin".equals(position));
        permissions.setManager("Manager".equals(position));
        permissionsRepository.save(permissions);

        return new AdminEmployeeListItemResponse(
                savedAccount.getAccountId(),
                buildFullName(savedAccount),
                position
        );
    }

    /**
     * Sanitises a required text field by trimming and collapsing whitespace.
     *
     * @param value the raw field value
     * @param fieldName display field name for errors
     * @return sanitised value
     */
    private String sanitiseText(final String value, final String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }

        // Trimming and replacing multiple whitespaces with a single space
        String sanitised = value.trim().replaceAll("\\s{2,}", " ");
        if (sanitised.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required.");
        }

        return sanitised;
    }

    /**
     * Sanitises an optional text field.
     *
     * @param value raw field value
     * @return trimmed value or null
     */
    private String sanitiseOptionalText(final String value) {
        if (value == null) {
            return null;
        }

        String sanitised = value.trim().replaceAll("\\s{2,}", " ");
        return sanitised.isBlank() ? null : sanitised;
    }

    /**
     * Validates a name field.
     *
     * @param value the sanitised name
     * @param fieldName display field name for errors
     */
    private void validateName(final String value, final String fieldName) {
        if (!NAME_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException(
                    fieldName + " may only contain letters, spaces, apostrophes, and hyphens."
            );
        }
    }

    /**
     * Sanitises email.
     *
     * @param email raw email
     * @return lower-cased trimmed email
     */
    private String sanitiseEmail(final String email) {
        if (email == null) {
            throw new IllegalArgumentException("Email is required.");
        }

        String sanitised = email.trim().toLowerCase();
        if (sanitised.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank.");
        }

        return sanitised;
    }

    /**
     * Sanitises and validates the new employee's phone input.
     *
     * @param phoneNumber raw phone number
     * @return sanitised phone number
     */
    private String sanitisePhoneNumber(final String phoneNumber) {
        if (phoneNumber == null) {
            throw new IllegalArgumentException("Phone number is required.");
        }

        String trimmed = phoneNumber.trim();
        if (trimmed.isBlank()) {
            throw new IllegalArgumentException("Phone number is required.");
        }

        if (!PHONE_INPUT_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Phone number contains invalid characters.");
        }

        String sanitised = trimmed.replaceAll("[()\\-\\s]", "");
        if (sanitised.length() > MAX_PHONE_NUMBER_LENGTH) {
            throw new IllegalArgumentException("Phone number is too long.");
        }

        return sanitised;
    }

    /**
     * Sanitises and validates the new members postal code.
     *
     * @param postalCode raw postal code
     * @return upper-cased trimmed postal code
     */
    private String sanitisePostalCode(final String postalCode) {
        if (postalCode == null) {
            throw new IllegalArgumentException("Postal code is required.");
        }

        String sanitised = postalCode.trim().replaceAll("\\s{2,}", " ").toUpperCase();
        if (sanitised.isBlank()) {
            throw new IllegalArgumentException("Postal code is required.");
        }

        if (sanitised.length() > MAX_POSTAL_CODE_LENGTH) {
            throw new IllegalArgumentException("Postal code is too long.");
        }

        if (!POSTAL_CODE_PATTERN.matcher(sanitised).matches()) {
            throw new IllegalArgumentException("Postal code contains invalid characters.");
        }

        return sanitised;
    }

    /**
     * Sanitises username.
     *
     * @param username raw username
     * @return trimmed username
     */
    private String sanitiseUsername(final String username) {
        if (username == null) {
            throw new IllegalArgumentException("Username is required.");
        }

        String sanitised = username.trim();
        if (sanitised.isBlank()) {
            throw new IllegalArgumentException("Username cannot be blank.");
        }

        return sanitised;
    }

    /**
     * Ensures the password meets the requirements.
     *
     * @param password raw password
     * @return password if valid
     */
    private String validatePassword(final String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }

        return password;
    }

    /**
     * Ensures the position is one of the recognised values; Employee, Manager, or Admin.
     *
     * @param position raw position
     * @return Employee, Manager, or Admin
     */
    private String normalisePosition(final String position) {
        if (position == null || position.isBlank()) {
            throw new IllegalArgumentException("Position is required.");
        }

        return switch (position.trim().toLowerCase()) {
            case "employee" -> "Employee";
            case "manager" -> "Manager";
            case "admin" -> "Admin";
            default -> throw new IllegalArgumentException("Position must be either an Employee, Manager, or Admin.");
        };
    }

    /**
     * Validates whether the current user is authorised to create an employee with the requested position.
     * So only an admin can create another admin, and either can create a manager or employee.
     *
     * @param position requested position
     * @param claims current user's claims
     */
    private void validateCreatePermission(final String position, final List<String> claims) {
        boolean isAdmin = claims.contains("ROLE_ADMIN");
        boolean isManager = claims.contains("ROLE_MANAGER");

        if (!isAdmin && !isManager) {
            throw new SecurityException("You do not have permission to add employees.");
        }

        if ("Admin".equals(position)  && !isAdmin) {
            throw new SecurityException("Only admins can give admin permissions to a new account.");
        }
    }
}
