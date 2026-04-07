package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ClockInStatusResponse;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for handling clock-in related operations and statistics.
 */
@Service
@RequiredArgsConstructor
public class ClockInService {

    /** The time that is considered the start of a working day. Clock-ins after this are considered late. */
    private static final LocalTime WORK_START_TIME = LocalTime.of(9, 0);

    /** Formatter for outputting times in HH:mm format. */
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /** Formatter for outputting dates in a readable format, e.g. "Monday, 6 April 2026". */
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, d MMMM, yyyy");

    /** Service for retrieving the currently authenticated user. */
    private final AuthenticationService authenticationService;

    /** Repository for accessing clock-in records. */
    private final ClockInRepository clockInRepository;

    /**
     * Retrieves yesterday's clock-in activity and the current month's statistics
     * for the authenticated user.
     * @return a ClockInStatusResponse containing yesterday's times and monthly stats
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found
     */
    public ClockInStatusResponse getStatus() throws AuthenticatedAccountNotFoundException {
        AccountTable account = authenticationService.getCurrentUser();

        LocalDate today = LocalDate.now(Clock.systemUTC());
        LocalDate yesterday = today.minusDays(1);

        // Fetch yesterday's record
        LocalDateTime startOfYesterday = yesterday.atStartOfDay();
        LocalDateTime endOfYesterday = yesterday.atTime(LocalTime.MAX);

        List<ClockInTable> yesterdayRecords = clockInRepository
                .findByAccountAndCreatedBetweenOrderByCreatedDesc(
                        account, startOfYesterday, endOfYesterday
                );

        String yesterdayClockIn = null;
        String yesterdayClockOut = null;

        if (!yesterdayRecords.isEmpty()) {
            ClockInTable record = yesterdayRecords.getFirst();

            if (record.getClockInTime() != null) {
                yesterdayClockIn = record.getClockInTime().format(TIME_FORMATTER);
            }
            if (record.getClockOutTime() != null) {
                yesterdayClockOut = record.getClockOutTime().format(TIME_FORMATTER);
            }
        }

        // Fetch this month's records for stats
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.atTime(LocalTime.MAX);

        List<ClockInTable> monthRecords = clockInRepository
                .findByAccountAndCreatedBetweenOrderByCreatedDesc(
                        account, startOfMonth, endOfMonth
                );

        // Calculate stats from monthly records
        int daysWorked = monthRecords.size();
        int totalLates = 0;
        double totalHoursWorked = 0;

        for (ClockInTable record : monthRecords) {
            LocalTime clockIn = record.getClockInTime();
            LocalTime clockOut = record.getClockOutTime();

            if (clockIn != null) {
                if (clockIn.isAfter(WORK_START_TIME)) {
                    totalLates++;
                }

                if (clockOut != null) {
                    double hoursWorked = (clockOut.toSecondOfDay() - clockIn.toSecondOfDay()) / 3600.0;
                    if (hoursWorked > 0) {
                        totalHoursWorked += hoursWorked;
                    }
                }
            }
        }

        double onTimePercent = daysWorked > 0
                ? Math.round(((daysWorked - totalLates) / (double) daysWorked) * 1000.0) / 10.0
                : 100.0;

        double avgHoursPerDay = daysWorked > 0
                ? Math.round((totalHoursWorked / daysWorked) * 10.0) / 10.0
                : 0.0;

        return new ClockInStatusResponse(
                yesterdayClockIn,
                yesterdayClockOut,
                yesterday.format(DATE_FORMATTER),
                totalLates,
                onTimePercent,
                avgHoursPerDay,
                daysWorked
        );
    }

    /**
     * Accepts a clock-in issue report submitted by the authenticated user.
     * @param issue the description of the issue to report
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found
     * @throws IllegalArgumentException if the issue description is blank
     */
    public void reportIssue(final String issue)
            throws AuthenticatedAccountNotFoundException, IllegalArgumentException {
        if (issue == null || issue.isBlank()) {
            throw new IllegalArgumentException("Issue description must not be blank.");
        }

        authenticationService.getCurrentUser();

        // TODO: Persist the report to a ClockInReportTable or notify a manager via email/notification
    }
}
