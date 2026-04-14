package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ClockInRecordResponse;
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
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for handling clock-in related operations and statistics.
 */
@Service
@RequiredArgsConstructor
public class ClockInService {

    /** Number of recent clock-in records to return for the report dropdown. */
    private static final int RECENT_RECORDS_LIMIT = 10;

    /** Number of seconds in one hour, used to convert seconds to hours. */
    private static final double SECONDS_PER_HOUR = 3600.0;

    /** Multiplier used to shift three decimal places before rounding on-time percent. */
    private static final double PERCENT_ROUNDING_FACTOR = 1000.0;

    /** Divisor used to shift one decimal place back after rounding on-time percent. */
    private static final double PERCENT_ROUNDING_DIVISOR = 10.0;

    /** Multiplier used to shift one decimal place before rounding average hours. */
    private static final double HOURS_ROUNDING_FACTOR = 10.0;

    /** Divisor used to shift one decimal place back after rounding average hours. */
    private static final double HOURS_ROUNDING_DIVISOR = 10.0;

    /** Default on-time percentage returned when no records exist for the period. */
    private static final double DEFAULT_ON_TIME_PERCENT = 100.0;

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
                    double hoursWorked =
                            (effectiveClockOut.toSecondOfDay() - clockIn.toSecondOfDay()) / SECONDS_PER_HOUR;
                    if (hoursWorked > 0) {
                        totalHoursWorked += hoursWorked;
                    }
                }
            }
        }

        double onTimePercent = daysWorked > 0
                ? Math.round(((daysWorked - totalLates) / (double) daysWorked)
                * PERCENT_ROUNDING_FACTOR) / PERCENT_ROUNDING_DIVISOR
                : DEFAULT_ON_TIME_PERCENT;

        double avgHoursPerDay = daysWorked > 0
                ? Math.round((totalHoursWorked / daysWorked)
                * HOURS_ROUNDING_FACTOR) / HOURS_ROUNDING_DIVISOR
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
     * Returns the most recent clock-in records for the authenticated user,
     * used to populate the report issue dropdown.
     * @return a list of up to {@value RECENT_RECORDS_LIMIT} recent clock-in records
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found
     */
    public List<ClockInRecordResponse> getRecentRecords() throws AuthenticatedAccountNotFoundException {
        AccountTable account = authenticationService.getCurrentUser();

        return clockInRepository
                .findByAccountOrderByCreatedDesc(account)
                .stream()
                .limit(RECENT_RECORDS_LIMIT)
                .map(record -> new ClockInRecordResponse(
                        record.getClockInId(),
                        record.getClockInTime() != null
                                ? record.getClockInTime().format(TIME_FORMATTER) : null,
                        record.getClockOutTime() != null
                                ? record.getClockOutTime().format(TIME_FORMATTER) : null,
                        record.getCreated().toLocalDate().format(DATE_FORMATTER)
                ))
                .collect(Collectors.toList());
    }

    /**
     * Persists a clock-in issue report submitted by the authenticated user,
     * linked to the specific clock-in record being disputed.
     * @param clockId the UUID of the clock-in record being disputed
     * @param issue the description of the issue to report
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found
     * @throws IllegalArgumentException if the issue is blank or the clock ID is not found
     */
    public void reportIssue(final UUID clockId, final String issue)
            throws AuthenticatedAccountNotFoundException, IllegalArgumentException {
        if (issue == null || issue.isBlank()) {
            throw new IllegalArgumentException("Issue description must not be blank.");
        }

        AccountTable account = authenticationService.getCurrentUser();

        ClockInTable clockIn = clockInRepository.findById(clockId)
                .orElseThrow(() -> new IllegalArgumentException("Clock-in record not found."));

        // Ensure the record belongs to the authenticated user
        if (!clockIn.getAccount().getAccountId().equals(account.getAccountId())) {
            throw new IllegalArgumentException("Clock-in record does not belong to this account.");
        }

        // Update the existing report if one exists, otherwise create a new one
        ClockInReportTable report = clockInReportRepository
                .findByAccountAndClockIn(account, clockIn)
                .orElseGet(ClockInReportTable::new);

        report.setAccount(account);
        report.setClockIn(clockIn);
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
