package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Represents the next upcoming approved leave booking for an employee.
 */
@Data
@AllArgsConstructor
public class AdminEmployeeUpcomingLeaveResponse {

    /** Leave type label for display. */
    private String leaveType;

    /** Start date and time of the leave. */
    private LocalDateTime startDate;

    /** End date and time of the leave. */
    private LocalDateTime endDate;
}
