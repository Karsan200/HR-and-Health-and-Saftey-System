package uk.co.garagebridgend.backend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.dto.LeaveCalendarDTO;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.repositories.LeaveRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;

    public List<LeaveCalendarDTO> getAllLeaveDates() {

        List<LeaveTable> leaveList = leaveRepository.findAll();

        return leaveList.stream()
                .map(leave -> new LeaveCalendarDTO(
                        leave.getStartDate(),
                        leave.getEndDate()
                ))
                .collect(Collectors.toList());
    }

}