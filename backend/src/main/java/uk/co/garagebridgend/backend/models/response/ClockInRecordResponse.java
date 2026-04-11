package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response model representing a single clock-in record for display in the
 * report issue dropdown.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClockInRecordResponse {

    /**
     * The UUID of the clock-in record.
     */
    private UUID clockId;

    /**
     * The clock-in time in HH:mm format.
     */
    private String clockInTime;

    /**
     * The clock-out time in HH:mm format, or null if the employee has not clocked out.
     */
    private String clockOutTime;

    /**
     * The date the record was created, formatted as "Monday, 6 April, 2026".
     */
    private String date;
}
