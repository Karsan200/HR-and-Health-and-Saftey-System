package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO representing a summary of a risk assessment,
 * including its title, hazard count, and creation timestamp.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RiskAssessmentResponse {
    /** The ID of the risk assessment. */
    private Long riskAssessmentId;

    /** The title of the risk assessment. */
    private String title;

    /** The number of hazards linked to this risk assessment. */
    private int hazardCount;

    /** The creation timestamp of the risk assessment. */
    private LocalDateTime created;

    private boolean hasDrafts;
}