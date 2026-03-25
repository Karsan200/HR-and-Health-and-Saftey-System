package uk.co.garagebridgend.backend.logic;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.request.LeaveRequest;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;
import uk.co.garagebridgend.backend.models.response.LeaveTypeResponse;
import uk.co.garagebridgend.backend.repository.LeaveTypeRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service responsible for handling business logic related to employee leave.
 */
@Service
@RequiredArgsConstructor
public class LeaveService {

    /** Standard work hours per full Monday to Thursday leave day. */
    private static final int MONDAY_TO_THURSDAY_HOURS = 9;

    /** Standard work hours per full Friday leave day. */
    private static final int FRIDAY_HOURS = 4;

    /** Total holiday allowance in hours for a user. */
    private static final int TOTAL_ALLOWANCE_HOURS = 160;

    /** Number of minutes in one hour. */
    private static final int MINUTES_PER_HOUR = 60;

    /** Friday day-of-week value used by java.time.DayOfWeek. */
    private static final int FRIDAY_DAY_VALUE = 5;

    /** Saturday day-of-week value used by java.time.DayOfWeek. */
    private static final int SATURDAY_DAY_VALUE = 6;

    /** Sunday day-of-week value used by java.time.DayOfWeek. */
    private static final int SUNDAY_DAY_VALUE = 7;

    /** Monday to Thursday work day start hour. */
    private static final int MONDAY_TO_THURSDAY_START_HOUR = 8;

    /** Monday to Thursday work day start minute. */
    private static final int MONDAY_TO_THURSDAY_START_MINUTE = 0;

    /** Monday to Thursday work day end hour. */
    private static final int MONDAY_TO_THURSDAY_END_HOUR = 17;

    /** Monday to Thursday work day end minute. */
    private static final int MONDAY_TO_THURSDAY_END_MINUTE = 0;

    /** Friday work day start hour. */
    private static final int FRIDAY_START_HOUR = 8;

    /** Friday work day start minute. */
    private static final int FRIDAY_START_MINUTE = 0;

    /** Friday work day end hour. */
    private static final int FRIDAY_END_HOUR = 12;

    /** Friday work day end minute. */
    private static final int FRIDAY_END_MINUTE = 0;

    /** Monday to Thursday work day start time. */
    private static final LocalTime MONDAY_TO_THURSDAY_START_TIME =
            LocalTime.of(MONDAY_TO_THURSDAY_START_HOUR, MONDAY_TO_THURSDAY_START_MINUTE);

    /** Monday to Thursday work day end time. */
    private static final LocalTime MONDAY_TO_THURSDAY_END_TIME =
            LocalTime.of(MONDAY_TO_THURSDAY_END_HOUR, MONDAY_TO_THURSDAY_END_MINUTE);

    /** Friday work day start time. */
    private static final LocalTime FRIDAY_START_TIME =
            LocalTime.of(FRIDAY_START_HOUR, FRIDAY_START_MINUTE);

    /** Friday work day end time. */
    private static final LocalTime FRIDAY_END_TIME =
            LocalTime.of(FRIDAY_END_HOUR, FRIDAY_END_MINUTE);

    /**
     * Repository used to access leave data from the database.
     */
    private final LeaveRepository leaveRepository;

    /**
     * Repository used to access leave type data from the database.
     */
    private final LeaveTypeRepository leaveTypeRepository;

    /**
     * Repository used to access account data from the database.
     */
    private final AccountRepository accountRepository;

    /**
     * Service used to access authentication information about the currently logged-in user.
     **/
    private final AuthenticationService authenticationService;

    /**
     * Retrieves all approved leave entries for calendar display.
     *
     * @return a list of {@link LeaveCalendarResponse} objects containing leave dates
     */
    public List<LeaveCalendarResponse> getAllLeaveDates() {
        // Only fetch approved leaves
        List<LeaveTable> leaveList = leaveRepository.findAll()
                .stream()
                .filter(LeaveTable::isApproved)
                .toList();

        return leaveList.stream()
                .map(leave -> new LeaveCalendarResponse(
                        leave.getStartDate(),
                        leave.getEndDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all approved leave entries for a specific date.
     *
     * @param date the date to check for leave entries
     * @return a list of {@link LeaveDayResponse} objects representing employees on leave
     * @throws IllegalArgumentException if the provided date string is not in the expected format
     */
    public List<LeaveDayResponse> getLeaveForDate(final String date)
            throws IllegalArgumentException {

        LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(date);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format. Expected format: YYYY-MM-DD");
        }

        LocalDateTime startOfDay = parsedDate.atStartOfDay();
        LocalDateTime endOfDay = parsedDate.atTime(LocalTime.MAX);

        List<LeaveTable> leave = leaveRepository.findLeaveForDate(startOfDay, endOfDay);

        return leave.stream()
                .map(l -> {
                    boolean isFullDay = isFullDayLeave(l);

                    return new LeaveDayResponse(
                            l.getAccount().getFirstName() + " " + l.getAccount().getLastName(),
                            "Technician",
                            l.getStartDate(),
                            l.getEndDate(),
                            !isFullDay // partialDay = true if NOT full day
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a summary of leave for the currently authenticated user.
     *
     * @return a {@link LeaveSummaryResponse} containing the remaining hours,
     * count of pending leaves, and count of approved leaves for the current user
     * @throws RuntimeException if no user is currently authenticated
     */
    public LeaveSummaryResponse getLeaveSummaryForCurrentUser() {
        User user = AuthenticationService.getCurrentUser();
        if (user == null) {
            throw new AuthenticatedAccountNotFoundException();
        }

        Long accountId = Long.valueOf(user.getUsername());

        List<LeaveTable> leaves = leaveRepository.findAll()
                .stream()
                .filter(l -> l.getAccount().getAccountId().equals(accountId))
                .toList();

        int approved = 0;
        int pending = 0;
        int usedHours = 0;

        for (LeaveTable leave : leaves) {
            long leaveMinutes = calculateWorkingMinutesBetween(
                leave.getStartDate(),
                leave.getEndDate()
            );
            int leaveHours = (int) Math.ceil((double) leaveMinutes / MINUTES_PER_HOUR);

            if (leave.isApproved()) {
                approved++;
                usedHours += leaveHours;
            } else {
                pending++;
            }
        }

        int remainingHours = TOTAL_ALLOWANCE_HOURS - usedHours;

        return new LeaveSummaryResponse(
                remainingHours,
                pending,
                approved
        );
    }

    /**
     * Retrieves all leave types available for booking.
     *
     * @return a list of {@link LeaveTypeResponse} objects
     */
    public List<LeaveTypeResponse> getLeaveTypes() {
        List<LeaveTypeTable> leaveTypes = leaveTypeRepository.findAll();

        return leaveTypes.stream()
                .map(leaveType -> new LeaveTypeResponse(
                        leaveType.getLeaveTypeId(),
                        leaveType.getName(),
                        leaveType.getColourIcon(),
                        leaveType.getColourBg(),
                        leaveType.getIconType()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Creates a new leave request based on the provided data.
     *
     * @param request the leave request data containing start date, end date, leave type, and notes
     * @throws IllegalArgumentException if any required fields are missing or if the date range is invalid
     */
    @Transactional
    public void createLeave(final LeaveRequest request)
            throws IllegalArgumentException {

        validateLeaveRequest(request);

        AccountTable account = getAuthenticatedAccount();
        LeaveTypeTable leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid leave type id."));

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setApproved(false);
        leave.setNotes(request.getNotes());

        leaveRepository.save(leave);
    }

    /**
     * Validates the leave request data.
     *
     * @param request the leave request to validate
     * @throws IllegalArgumentException if any required fields are missing or if the date range is invalid
     */
    private void validateLeaveRequest(final LeaveRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Leave request is required.");
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
        if (request.getLeaveTypeId() == null) {
            throw new IllegalArgumentException("Leave type is required.");
        }
    }

    /**
     * Retrieves the currently authenticated account.
     *
     * @return the authenticated account
     * @throws AuthenticatedAccountNotFoundException if no authenticated user or account is found
     */
    private AccountTable getAuthenticatedAccount() {
        var user = AuthenticationService.getCurrentUser();

        if (user != null) {
            return accountRepository.findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }
    }

    /**
     * Checks whether the leave entry matches the working hours for full-day leave.
     *
     * @param leave the leave entry to check
     * @return true when the leave covers full working days, otherwise false
     */
    private boolean isFullDayLeave(final LeaveTable leave) {
        LocalTime expectedStartTime = getWorkDayStartTime(leave.getStartDate().toLocalDate());
        LocalTime expectedEndTime = getWorkDayEndTime(leave.getEndDate().toLocalDate());

        return leave.getStartDate().toLocalTime().equals(expectedStartTime)
                && leave.getEndDate().toLocalTime().equals(expectedEndTime);
    }

    /**
     * Calculates the total number of working minutes between two date-times.
     * Only working hours are counted and weekends are ignored.
     *
     * @param startDateTime the leave start date and time
     * @param endDateTime the leave end date and time
     * @return the total working minutes across the date range
     */
    private long calculateWorkingMinutesBetween(
            final LocalDateTime startDateTime,
            final LocalDateTime endDateTime) {

        if (endDateTime.isBefore(startDateTime)) {
            return 0;
        }

        long totalMinutes = 0;
        LocalDate currentDate = startDateTime.toLocalDate();
        LocalDate endDate = endDateTime.toLocalDate();

        while (!currentDate.isAfter(endDate)) {
            if (!isWeekend(currentDate)) {
                LocalDateTime workDayStart = currentDate.atTime(getWorkDayStartTime(currentDate));
                LocalDateTime workDayEnd = currentDate.atTime(getWorkDayEndTime(currentDate));

                LocalDateTime effectiveStart = workDayStart;
                LocalDateTime effectiveEnd = workDayEnd;

                if (currentDate.equals(startDateTime.toLocalDate()) && startDateTime.isAfter(workDayStart)) {
                    effectiveStart = startDateTime;
                }

                if (currentDate.equals(endDateTime.toLocalDate()) && endDateTime.isBefore(workDayEnd)) {
                    effectiveEnd = endDateTime;
                }

                if (effectiveEnd.isAfter(effectiveStart)) {
                    totalMinutes += Duration.between(effectiveStart, effectiveEnd).toMinutes();
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        return totalMinutes;
    }

    /**
     * Returns the working-day start time for the supplied date.
     *
     * @param date the date being checked
     * @return the expected working-day start time
     */
    private LocalTime getWorkDayStartTime(final LocalDate date) {
        if (isFriday(date)) {
            return FRIDAY_START_TIME;
        }

        return MONDAY_TO_THURSDAY_START_TIME;
    }

    /**
     * Returns the working-day end time for the supplied date.
     *
     * @param date the date being checked
     * @return the expected working-day end time
     */
    private LocalTime getWorkDayEndTime(final LocalDate date) {
        if (isFriday(date)) {
            return FRIDAY_END_TIME;
        }

        return MONDAY_TO_THURSDAY_END_TIME;
    }

    /**
     * Checks whether the supplied date falls on a Friday.
     *
     * @param date the date being checked
     * @return true if the date is Friday, otherwise false
     */
    private boolean isFriday(final LocalDate date) {
        return date.getDayOfWeek().getValue() == FRIDAY_DAY_VALUE;
    }

    /**
     * Checks whether the supplied date falls on a weekend.
     *
     * @param date the date being checked
     * @return true if the date is Saturday or Sunday, otherwise false
     */
    private boolean isWeekend(final LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue();
        return dayOfWeek == SATURDAY_DAY_VALUE || dayOfWeek == SUNDAY_DAY_VALUE;
    }
}
