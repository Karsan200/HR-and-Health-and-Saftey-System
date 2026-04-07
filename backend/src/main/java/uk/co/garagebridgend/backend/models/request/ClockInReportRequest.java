package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request model for submitting a clock-in issue report.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClockInReportRequest {

    /**
     * The UUID of the specific clock-in record being disputed.
     */
    private UUID clockId;

    /**
     * Description of the issue the employee wants to report.
     */
    private String issue;
}