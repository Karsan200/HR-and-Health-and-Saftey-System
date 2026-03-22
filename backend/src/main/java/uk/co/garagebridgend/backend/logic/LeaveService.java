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
        LocalDateTime endOfDay = parsedDate.atTime(23, 59, 59);

        List<LeaveTable> leave = leaveRepository.findLeaveForDate(startOfDay, endOfDay);

        return leave.stream()
                .map(l -> {
                    boolean isFullDay =
                            l.getStartDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT) &&
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

        // Total allowance of hours for all users to use for holiday's
        int totalAllowanceHours = 160;

        int usedHours = 0;

        for (LeaveTable leave : leaves) {

            long hours;

            boolean isFullDay =
                    leave.getStartDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT) &&
                            leave.getEndDate().toLocalTime().equals(java.time.LocalTime.MIDNIGHT);

            if (isFullDay) {
                long days = java.time.Duration.between(
                        leave.getStartDate().toLocalDate().atStartOfDay(),
                        leave.getEndDate().toLocalDate().atStartOfDay()
                ).toDays() + 1;

                hours = days * 8;
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

        int remainingHours = totalAllowanceHours - usedHours;

        return new LeaveSummaryResponse(
                remainingHours,
                pending,
                approved
        );
    }

}
