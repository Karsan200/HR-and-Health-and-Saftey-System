package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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

import java.sql.Time;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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

    /** Repository for account data. */
    private final AccountRepository accountRepository;

    /** Repository for permission data. */
    private final PermissionsRepository permissionsRepository;

    /** Repository for clock-in data. */
    private final ClockInRepository clockInRepository;

    /** Repository for leave data. */
    private final LeaveRepository leaveRepository;

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
                Time.valueOf(LATE_THRESHOLD),
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

            LocalTime startTime = clockIn.getClockInTime().toLocalTime();
            LocalTime endTime = clockIn.getClockOutTime().toLocalTime();

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
}
