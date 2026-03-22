package uk.co.garagebridgend.backend.logic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.response.LeaveCalendarResponse;
import uk.co.garagebridgend.backend.models.response.LeaveDayResponse;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.response.LeaveSummaryResponse;
import uk.co.garagebridgend.backend.repository.LeaveRepository;

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
    public LeaveSummaryResponse getLeaveSummaryForCurrentUser() {
        User user = AuthenticationService.getCurrentUser();

        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        Long accountId = Long.valueOf(user.getUsername());

        List<LeaveTable> leaves = leaveRepository.findAll()
                .stream()
                .filter(l -> l.getAccount().getAccountId().equals(accountId))
                .toList();

        int approved = 0;
        int pending = 0;

        int totalAllowanceHours = 160;

        int usedHours = 0;

        for (LeaveTable leave : leaves) {

            // Calculate hours per leave
            long days = java.time.Duration.between(
                    leave.getStartDate().toLocalDate().atStartOfDay(),
                    leave.getEndDate().toLocalDate().atStartOfDay()
            ).toDays() + 1;

            // convert days to hours
            long hours = days * 8;

            // Minimum 8 hours for same-day leave
            if (hours == 0) {
                hours = 8;
            }

            if (leave.isApproved()) {
                approved++;
                usedHours += hours;
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

}
