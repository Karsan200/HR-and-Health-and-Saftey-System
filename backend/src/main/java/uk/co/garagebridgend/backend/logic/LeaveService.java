package uk.co.garagebridgend.backend.logic;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.request.LeaveDecisionRequest;
import uk.co.garagebridgend.backend.models.request.LeaveRequest;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarAdminResponse;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.models.response.PendingLeaveResponse;
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

    /** Number of minutes in one hour. */
    private static final int MINUTES_PER_HOUR = 60;

    /** Total holiday allowance in hours for a user. */
    @Value("${leave.total-allowance-hours}")
    private int totalAllowanceHours;

    /** Minimum number of days in advance that a leave request must be made. */
    @Value("${leave.minimum-advance-booking-days}")
    private int minimumAdvanceBookingDays;

    /** Maximum number of approved leaves allowed per day. */
    @Value("${leave.max-approved-per-day}")
    private int maxApprovedPerDay;

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

    /** Repository used to access leave data from the database. */
    private final LeaveRepository leaveRepository;

    /** Repository used to access leave type data from the database. */
    private final LeaveTypeRepository leaveTypeRepository;

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /**
     * Retrieves all approved leave entries for a given month and expands multi-day
     * leave records into one {@link LeaveCalendarAdminResponse} per calendar day.
     * Weekends are excluded from the expansion since the calendar only shows weekdays.
     *
     * @param year the calendar year to query
     * @param month the calendar month to query (1 = January, 12 = December)
     * @return a flat list of calendar items, one per employee per working day on leave
     */
    public List<LeaveCalendarAdminResponse> getCalendarItems(final int year, final int month) {
        YearMonth yearMonth = YearMonth.of(year, month);

        // Fetch all leave that overlaps the requested month
        LocalDateTime rangeStart = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime rangeEnd = yearMonth.atEndOfMonth().atTime(LocalTime.MAX);

        List<LeaveTable> leaveList = leaveRepository.findApprovedLeaveInRange(rangeStart, rangeEnd);

        List<LeaveCalendarAdminResponse> items = new ArrayList<>();

        for (LeaveTable leave : leaveList) {
            String employeeName = leave.getAccount().getFirstName()
                    + " " + leave.getAccount().getLastName();
            String leaveType = leave.getLeaveType().getName();
            String notes = leave.getNotes();

            // Expand each leave record into one item per calendar day it covers
            LocalDate current = leave.getStartDate().toLocalDate();
            LocalDate end = leave.getEndDate().toLocalDate();

            while (!current.isAfter(end)) {
                // Only include days within the requested month and skip weekends
                if (current.getYear() == year
                        && current.getMonthValue() == month
                        && !isWeekend(current)) {
                    items.add(new LeaveCalendarAdminResponse(current, employeeName, leaveType, notes));
                }
                current = current.plusDays(1);
            }
        }

        return items;
    }

    /**
     * Retrieves all approved leave entries for calendar display.
     *
     * @return a list of {@link LeaveCalendarResponse} objects containing leave dates
     */
    public List<LeaveCalendarResponse> getAllLeaveDates() {
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
                            !isFullDay
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
        AccountTable account = authenticationService.getCurrentUser();

        Long accountId = account.getAccountId();

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

        int remainingHours = totalAllowanceHours - usedHours;

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

        validateFieldsFilled(request);
        validateLeaveRequestIsInAdvance(request);
        validateLeaveRequestWithinWorkingHours(request);
        validateLeaveRequestDayCapacity(request);

        AccountTable account = authenticationService.getCurrentUser();
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
     * Retrieves all leave requests that are currently pending approval.
     * A request is considered pending when it is not approved and has no
     * response set (i.e. it has not been declined either).
     *
     * @return a list of {@link PendingLeaveResponse} objects ordered oldest first
     */
    public List<PendingLeaveResponse> getPendingLeave() {
        return leaveRepository.findPendingLeave()
                .stream()
                .map(leave -> new PendingLeaveResponse(
                        leave.getLeaveId(),
                        leave.getAccount().getFirstName() + " " + leave.getAccount().getLastName(),
                        leave.getLeaveType().getName(),
                        leave.getStartDate(),
                        leave.getEndDate(),
                        leave.getNotes(),
                        leave.getCreated()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Approves a pending leave request by setting its approved flag to true
     * and persisting an optional response message from the admin.
     *
     * @param leaveId  the ID of the leave record to approve
     * @param decision the decision body containing the optional admin response
     * @throws IllegalArgumentException if no leave record exists for the given ID,
     *                                  or if the record has already been actioned
     */
    @Transactional
    public void approveLeave(final Long leaveId, final LeaveDecisionRequest decision)
            throws IllegalArgumentException {

        LeaveTable leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found."));

        if (leave.isApproved()) {
            throw new IllegalArgumentException("This leave request has already been approved.");
        }

        if (leave.getResponse() != null) {
            throw new IllegalArgumentException("This leave request has already been declined.");
        }

        leave.setApproved(true);
        leave.setResponse(decision.response());
        leaveRepository.save(leave);
    }

    /**
     * Declines a pending leave request by leaving the approved flag as false
     * and persisting an optional response message from the admin.
     *
     * @param leaveId  the ID of the leave record to decline
     * @param decision the decision body containing the optional admin response
     * @throws IllegalArgumentException if no leave record exists for the given ID,
     *                                  or if the record has already been actioned
     */
    @Transactional
    public void declineLeave(final Long leaveId, final LeaveDecisionRequest decision)
            throws IllegalArgumentException {

        LeaveTable leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found."));

        if (leave.isApproved()) {
            throw new IllegalArgumentException("This leave request has already been approved.");
        }

        if (leave.getResponse() != null) {
            throw new IllegalArgumentException("This leave request has already been declined.");
        }

        // Approved stays false — a non-null response marks the request as declined
        leave.setResponse(decision.response() != null ? decision.response() : "Declined");
        leaveRepository.save(leave);
    }


    /**
     * Validates the leave request data.
     *
     * @param request the leave request to validate
     * @throws IllegalArgumentException if any required fields are missing or if the date range is invalid
     */
    private void validateFieldsFilled(final LeaveRequest request) {
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
     * Validates that the leave request is made at least a certain number of days in advance.
     *
     * @param request the leave request to validate
     * @throws IllegalArgumentException if the leave request is not made in advance
     */
    private void validateLeaveRequestIsInAdvance(final LeaveRequest request) {
        LocalDate minimumBookableDate = LocalDate.now().plusDays(minimumAdvanceBookingDays);

        if (request.getStartDate().toLocalDate().isBefore(minimumBookableDate)) {
            throw new IllegalArgumentException(
                    "Leave requests must be made at least "
                            + minimumAdvanceBookingDays
                            + " days in advance."
            );
        }

        if (request.getEndDate().toLocalDate().isBefore(minimumBookableDate)) {
            throw new IllegalArgumentException(
                    "Leave requests must be made at least "
                            + minimumAdvanceBookingDays
                            + " days in advance."
            );
        }
    }

    /**
     * Validates that the leave request does not exceed the maximum number of approved leaves allowed per day.
     *
     * @param request the leave request to validate
     * @throws IllegalArgumentException if any date within the leave request is fully booked
     */
    private void validateLeaveRequestDayCapacity(final LeaveRequest request) {
        LocalDate currentDate = request.getStartDate().toLocalDate();
        LocalDate endDate = request.getEndDate().toLocalDate();

        while (!currentDate.isAfter(endDate)) {
            if (!isWeekend(currentDate)) {
                LocalDateTime startOfDay = currentDate.atStartOfDay();
                LocalDateTime endOfDay = currentDate.atTime(LocalTime.MAX);

                long approvedLeaveCount = leaveRepository.findLeaveForDate(startOfDay, endOfDay)
                        .stream()
                        .filter(LeaveTable::isApproved)
                        .count();

                if (approvedLeaveCount >= maxApprovedPerDay) {
                    throw new IllegalArgumentException("One or more selected dates are fully booked.");
                }
            }

            currentDate = currentDate.plusDays(1);
        }
    }

    /**
     * Validates that the leave request start and end times fall within the defined working hours.
     *
     * @param request the leave request to validate
     * @throws IllegalArgumentException if the start or end time is outside of working hours
     */
    private void validateLeaveRequestWithinWorkingHours(final LeaveRequest request) {
        LocalDateTime startDateTime = request.getStartDate();
        LocalDateTime endDateTime = request.getEndDate();

        LocalTime allowedStartTimeForStartDate = getWorkDayStartTime(startDateTime.toLocalDate());
        LocalTime allowedEndTimeForStartDate = getWorkDayEndTime(startDateTime.toLocalDate());

        LocalTime allowedStartTimeForEndDate = getWorkDayStartTime(endDateTime.toLocalDate());
        LocalTime allowedEndTimeForEndDate = getWorkDayEndTime(endDateTime.toLocalDate());

        if (startDateTime.toLocalTime().isBefore(allowedStartTimeForStartDate)
                || startDateTime.toLocalTime().isAfter(allowedEndTimeForStartDate)) {
            throw new IllegalArgumentException("Start time must be within working hours.");
        }

        if (endDateTime.toLocalTime().isBefore(allowedStartTimeForEndDate)
                || endDateTime.toLocalTime().isAfter(allowedEndTimeForEndDate)) {
            throw new IllegalArgumentException("End time must be within working hours.");
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
            return fridayStartTime;
        }

        return mondayToThursdayStartTime;
    }

    /**
     * Returns the working-day end time for the supplied date.
     *
     * @param date the date being checked
     * @return the expected working-day end time
     */
    private LocalTime getWorkDayEndTime(final LocalDate date) {
        if (isFriday(date)) {
            return fridayEndTime;
        }

        return mondayToThursdayEndTime;
    }

    /**
     * Checks whether the supplied date falls on a Friday.
     *
     * @param date the date being checked
     * @return true if the date is Friday, otherwise false
     */
    private boolean isFriday(final LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.FRIDAY;
    }

    /**
     * Checks whether the supplied date falls on a weekend.
     *
     * @param date the date being checked
     * @return true if the date is Saturday or Sunday, otherwise false
     */
    private boolean isWeekend(final LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY
                || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }
}
