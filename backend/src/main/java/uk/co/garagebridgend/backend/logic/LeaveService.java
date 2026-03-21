package uk.co.garagebridgend.backend.logic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.request.LeaveRequest;
import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;
import uk.co.garagebridgend.backend.models.response.LeaveTypeResponse;
import uk.co.garagebridgend.backend.repository.LeaveTypeRepository;

/**
 * Service responsible for handling business logic related to employee leave.
 */
@Service
@RequiredArgsConstructor
public class LeaveService {

    /**
     * Repository used to access leave data from the database.
     */
    private final LeaveRepository leaveRepository;

    /**
     * Repository used to access leave type data from the database.
     */
    private final LeaveTypeRepository leaveTypeRepository;

    private final AccountRepository accountRepository;

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

        List<LeaveTable> leave = leaveRepository.findLeaveForDate(startOfDay);

        return leave.stream()
                .map(l -> new LeaveDayResponse(
                        l.getAccount().getFirstName() + " "
                                + l.getAccount().getLastName(),
                        "Technician", // Replace with real role if available in future
                        l.getEndDate()
                ))
                .collect(Collectors.toList());
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
    public void createLeave(final LeaveRequest request)
            throws IllegalArgumentException {

        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }

        if (request.getLeaveTypeId() == null) {
            throw new IllegalArgumentException("Leave type is required.");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("The start date cannot be after the end date.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Authenticated user not found.");
        }

        String username = authentication.getName();

        AccountTable account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated account not found."));

        LeaveTypeTable leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Selected leave type was not found."));

        LeaveTable leave = new LeaveTable();
        leave.setAccount(account);
        leave.setLeaveType(leaveType);
        leave.setStartDate(request.getStartDate().atStartOfDay());
        leave.setEndDate(request.getEndDate().atTime(23, 59, 59));
        leave.setApproved(false);
        leave.setNotes(request.getNotes());
        leave.setResponse(null);
        leave.setCreated(LocalDateTime.now());

        leaveRepository.save(leave);
    }
}
