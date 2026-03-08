package uk.co.garagebridgend.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import uk.co.garagebridgend.backend.models.dto.LeaveCalendarDTO;
import uk.co.garagebridgend.backend.services.LeaveService;

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

}