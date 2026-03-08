package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import uk.co.garagebridgend.backend.models.dto.LeaveCalendarDTO;
import uk.co.garagebridgend.backend.models.dto.LeaveDayDTO;
import uk.co.garagebridgend.backend.logic.LeaveService;

import java.time.LocalDate;
import java.util.List;
import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
@CrossOrigin
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/calendar")
    public List<LeaveCalendarDTO> getCalendarLeave() {
        return leaveService.getAllLeaveDates();
    }

    @GetMapping("/day/{date}")
    public List<LeaveDayDTO> getLeaveForDay(@PathVariable String date) {

        LocalDate parsedDate = LocalDate.parse(date);

        return leaveService.getLeaveForDate(parsedDate);
    }

}