package uk.co.garagebridgend.backend.logic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import uk.co.garagebridgend.backend.models.dto.LeaveCalendarDTO;
import uk.co.garagebridgend.backend.models.dto.LeaveDayDTO;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
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
     * @return a list of {@link LeaveCalendarDTO} objects containing leave dates
     */
    public List<LeaveCalendarDTO> getAllLeaveDates() {
        // Only fetch approved leaves
        List<LeaveTable> leaveList = leaveRepository.findAll()
                .stream()
                .filter(LeaveTable::isApproved)
                .toList();

        return leaveList.stream()
                .map(leave -> new LeaveCalendarDTO(
                        leave.getStartDate(),
                        leave.getEndDate()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all approved leave entries for a specific date.
     *
     * @param date the date to check for leave entries
     * @return a list of {@link LeaveDayDTO} objects representing employees on leave
     */
    public List<LeaveDayDTO> getLeaveForDate(final LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();

        List<LeaveTable> leave = leaveRepository.findLeaveForDate(startOfDay);

        return leave.stream()
                .map(l -> new LeaveDayDTO(
                        l.getAccount().getFirstName() + " "
                                + l.getAccount().getLastName(),
                        "Technician", // Replace with real role if available in future
                        l.getEndDate()
                ))
                .collect(Collectors.toList());
    }
}
