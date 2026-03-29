package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;


/**
 * Data Transfer Object representing a summary of leave for a user.
 */
@Data
@AllArgsConstructor
public class LeaveSummaryResponse {
    /** Remaining holiday allowance in hours for the user. */
    private int totalDays;

    /** Number of leave requests currently pending approval. */
    private int pendingCount;

    /** Number of leave requests that have been approved. */
    private int approvedCount;
}
