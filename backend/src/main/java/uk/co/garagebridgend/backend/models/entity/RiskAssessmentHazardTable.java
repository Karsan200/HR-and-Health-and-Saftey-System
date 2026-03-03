package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.EmbeddedId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/****
 * Represents the many-to-many relationship between risk assessments and hazards.
 * <p>
 * Each record links a single risk assessment to a single hazard, allowing for
 * multiple hazards to be associated with a single risk assessment and vice versa.
 * The composite primary key consists of {@code risk_assessment_id} and
 * {@code hazard_id}.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentHazardTable {

    /** Composite primary key consisting of {@code risk_assessment_id} and {@code hazard_id}. */
    @EmbeddedId
    private RiskAssessmentHazardId id;

    /** Risk assessment associated with this hazard. Maps to {@code risk_assessment_id}. */
    @ManyToOne
    @MapsId("riskAssessmentId")
    @JoinColumn(name = "risk_assessment_id", nullable = false)
    private RiskAssessmentTable riskAssessment;

    /** Hazard associated with this risk assessment. Maps to {@code hazard_id}. */
    @ManyToOne
    @MapsId("hazardId")
    @JoinColumn(name = "hazard_id", nullable = false)
    private HazardTable hazard;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
