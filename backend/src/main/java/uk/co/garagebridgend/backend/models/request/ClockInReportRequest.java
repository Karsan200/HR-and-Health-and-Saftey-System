package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request model for submitting a clock-in issue report.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClockInReportRequest {

    /**
     * Description of the issue the employee wants to report.
     */
    private String issue;
}
