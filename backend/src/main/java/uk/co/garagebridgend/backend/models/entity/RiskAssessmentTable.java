package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents a risk assessment document.
 * <p>
 * Stores the document's title, associated file (optional), and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RiskAssessmentTable {
    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_assessment_id")
    private Long riskAssessmentId;

    /**
     * File that contains a risk assessment document. References {@code file_id} in the
     * files table.
     */
    @ManyToOne
    @JoinColumn(name = "file_id", referencedColumnName = "file_id", nullable = true)
    private FilesTable file;

    /** Title of the risk assessment. */
    @Column(columnDefinition = "TEXT", name = "title", nullable = false)
    private String title;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
