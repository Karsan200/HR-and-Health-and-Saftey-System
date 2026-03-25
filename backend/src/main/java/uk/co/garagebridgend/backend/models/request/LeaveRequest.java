package uk.co.garagebridgend.backend.models.request;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request body used to create a new leave request.
 */
@Data
public class LeaveRequest {

    /**
     * Start date of the leave request.
     */
    private LocalDateTime startDate;

    /**
     * End date of the leave request.
     */
    private LocalDateTime endDate;

    /**
     * Selected leave type identifier.
     */
    private Integer leaveTypeId;

    /**
     * Optional notes supplied by the user.
     */
    private String notes;
}
