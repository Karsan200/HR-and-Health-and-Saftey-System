package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite primary key class for the RiskAssessmentHazard entity, combining
 * riskAssessmentId and hazardId.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentHazardId implements Serializable {
    /** ID of the associated risk assessment. */
    private Long riskAssessmentId;
    /** ID of the associated hazard. */
    private Long hazardId;
}
