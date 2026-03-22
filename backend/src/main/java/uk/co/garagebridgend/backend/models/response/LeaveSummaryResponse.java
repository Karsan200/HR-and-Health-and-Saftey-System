package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaveSummaryResponse {
    private int totalDays;
    private int pendingCount;
    private int approvedCount;
}
