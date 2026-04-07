package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ClockInStatusResponse;
import uk.co.garagebridgend.backend.repository.ClockInReportRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.Clock;
import java.time.DayOfWeek;
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

    /** Formatter for outputting times in HH:mm format. */
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /** Formatter for outputting dates in a readable format, e.g. "Monday, 6 April, 2026". */
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, d MMMM, yyyy");

    /** Monday to Thursday work day start time. */
    @Value("${leave.working-hours.monday-thursday.start}")
    private LocalTime mondayToThursdayStartTime;

    /** Monday to Thursday work day end time. */
    @Value("${leave.working-hours.monday-thursday.end}")
    private LocalTime mondayToThursdayEndTime;

    /** Friday work day start time. */
    @Value("${leave.working-hours.friday.start}")
    private LocalTime fridayStartTime;

    /** Friday work day end time. */
    @Value("${leave.working-hours.friday.end}")
    private LocalTime fridayEndTime;

    /** Service for retrieving the currently authenticated user. */
    private final AuthenticationService authenticationService;

    /** Repository for accessing clock-in records. */
    private final ClockInRepository clockInRepository;

    /** Repository for persisting clock-in issue reports. */
    private final ClockInReportRepository clockInReportRepository;

    /**
     * Retrieves yesterday's clock-in activity and the current year's statistics
     * for the authenticated user.
     * @return a ClockInStatusResponse containing yesterday's times and yearly stats
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

        // Fetch this year's records for stats (1st Jan to 31st Dec)
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfYear = today.withDayOfYear(today.lengthOfYear()).atTime(LocalTime.MAX);

        List<ClockInTable> yearRecords = clockInRepository
                .findByAccountAndCreatedBetweenOrderByCreatedDesc(
                        account, startOfYear, endOfYear
                );

        // Calculate stats from yearly records
        int daysWorked = yearRecords.size();
        int totalLates = 0;
        double totalHoursWorked = 0;

        for (ClockInTable record : yearRecords) {
            LocalTime clockIn = record.getClockInTime();
            LocalTime clockOut = record.getClockOutTime();

            // Use the expected start time for the day the record was created
            LocalDate recordDate = record.getCreated().toLocalDate();
            LocalTime expectedStart = getWorkDayStartTime(recordDate);
            LocalTime expectedEnd = getWorkDayEndTime(recordDate);

            if (clockIn != null) {
                // Count as late if clock-in is after the expected start for that day
                if (clockIn.isAfter(expectedStart)) {
                    totalLates++;
                }

                // Cap clock-out at the expected end time so overtime doesn't count towards average
                if (clockOut != null) {
                    LocalTime effectiveClockOut = clockOut.isAfter(expectedEnd) ? expectedEnd : clockOut;
                    double hoursWorked = (effectiveClockOut.toSecondOfDay() - clockIn.toSecondOfDay()) / 3600.0;
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

        AccountTable account = authenticationService.getCurrentUser();

        ClockInReportTable report = new ClockInReportTable();
        report.setAccount(account);
        report.setIssue(issue);

        clockInReportRepository.save(report);
    }

    /**
     * Returns the working-day start time for the supplied date.
     * @param date the date being checked
     * @return the expected working-day start time
     */
    private LocalTime getWorkDayStartTime(final LocalDate date) {
        if (date.getDayOfWeek() == DayOfWeek.FRIDAY) {
            return fridayStartTime;
        }
        return mondayToThursdayStartTime;
    }

    /**
     * Returns the working-day end time for the supplied date.
     * @param date the date being checked
     * @return the expected working-day end time
     */
    private LocalTime getWorkDayEndTime(final LocalDate date) {
        if (date.getDayOfWeek() == DayOfWeek.FRIDAY) {
            return fridayEndTime;
        }
        return mondayToThursdayEndTime;
    }
}