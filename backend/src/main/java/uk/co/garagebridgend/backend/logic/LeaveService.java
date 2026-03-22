package uk.co.garagebridgend.backend.logic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
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


    /** Standard work hours per full day of leave. */
    private static final int HOURS_PER_FULL_DAY = 8;

    /** Total holiday allowance in hours for a user. */
    private static final int TOTAL_ALLOWANCE_HOURS = 160;

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
                    boolean isFullDay =
                            l.getStartDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT)
                                    &&
                                    l.getEndDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT);

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

            long hours;

            boolean isFullDay =
                    leave.getStartDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT)
                            && leave.getEndDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT);

            if (isFullDay) {
                long days = java.time.Duration.between(
                        leave.getStartDate().toLocalDate().atStartOfDay(),
                        leave.getEndDate().toLocalDate().atStartOfDay()
                ).toDays() + 1;

                hours = days * HOURS_PER_FULL_DAY;
            } else {
                hours = java.time.Duration.between(
                        leave.getStartDate(),
                        leave.getEndDate()
                ).toHours();
            }

            if (leave.isApproved()) {
                approved++;
                usedHours += (int) hours;
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

        String username = leaveRequestChecks(request);

        AccountTable account = accountRepository.findByUsername(username)
                .orElseThrow(AuthenticatedAccountNotFoundException::new);
        LeaveTypeTable leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid leave type id."));

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(request.getStartDate().atStartOfDay());
        leave.setEndDate(request.getEndDate().atTime(23,59,59));
        leave.setApproved(false);
        leave.setNotes(request.getNotes());

        leaveRepository.save(leave);
    }

    /**
     * Validates the leave request data and retrieves the username of the currently authenticated user.
     *
     * @param request the leave request to validate
     * @return the username of the authenticated user
     * @throws IllegalArgumentException if any required fields are missing or if the date range is invalid
     * @throws AuthenticatedAccountNotFoundException if no authenticated user is found
     */
    @NotNull
    private static String leaveRequestChecks(final LeaveRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
        if (request.getLeaveTypeId() == null) {
            throw new IllegalArgumentException("Leave type is required.");
        }

        User user = AuthenticationService.getCurrentUser();
        if (user == null) {
            throw new AuthenticatedAccountNotFoundException();
        }

        return user.getUsername();
    }

}
