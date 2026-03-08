package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.dto.LeaveCalendarDTO;
import uk.co.garagebridgend.backend.models.dto.LeaveDayDTO;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.repository.LeaveRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;

    // Get all leaves for the calendar (start/end dates only)
    public List<LeaveCalendarDTO> getAllLeaveDates() {
        List<LeaveTable> leaveList = leaveRepository.findAll();

        return leaveList.stream()
                .map(leave -> new LeaveCalendarDTO(
                        leave.getStartDate(),
                        leave.getEndDate()
                ))
                .collect(Collectors.toList());
    }

    // Get leaves for a specific date
    public List<LeaveDayDTO> getLeaveForDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();

        // Call the repository method you already have
        List<LeaveTable> leave = leaveRepository.findLeaveForDate(startOfDay);

        return leave.stream()
                .map(l -> new LeaveDayDTO(
                        l.getAccount().getFirstName() + " " + l.getAccount().getLastName(),
                        "Technician",
                        l.getEndDate()
                ))
                .collect(Collectors.toList());
    }
}