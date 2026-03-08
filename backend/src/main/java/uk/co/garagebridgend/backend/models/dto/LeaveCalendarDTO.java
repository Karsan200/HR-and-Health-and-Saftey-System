package uk.co.garagebridgend.backend.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LeaveCalendarDTO {

    private LocalDateTime startDate;
    private LocalDateTime endDate;

}