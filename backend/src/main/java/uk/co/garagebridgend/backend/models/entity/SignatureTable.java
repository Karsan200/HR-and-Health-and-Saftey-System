package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"account_id", "risk_assessment_id"}),
                @UniqueConstraint(columnNames = {"account_id", "hazard_id"}),
                @UniqueConstraint(columnNames = {"account_id", "document_id"})
        }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignatureTable {
    /**
     * signature identifier (generated UUID).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "signature_id")
    private UUID signatureId;

    /**
     * Account that owns this signature. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /** Risk assessment that's been signed. Maps to {@code risk_assessment_id}. */
    @ManyToOne
    @JoinColumn(name = "risk_assessment_id", nullable = true)
    private RiskAssessmentTable riskAssessment;

    /** Hazard that's been signed. Maps to {@code hazard_id}. */
    @ManyToOne
    @JoinColumn(name = "hazard_id", nullable = true)
    private HazardTable hazard;

    /** Document that's been signed. Maps to {@code document_id}. */
    @ManyToOne
    @JoinColumn(name = "document_id", nullable = true)
    private DocumentTable document;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
