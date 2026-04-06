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
 * Represents a hazard report submitted by an account.
 * <p>
 * Stores the hazard's title, six questions describing the hazard, priority,
 * resolution status, and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HazardTable {
    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hazard_id")
    private Long hazardId;

    /**
     * Account that created this hazard. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /** Title of the hazard. */
    @Column(columnDefinition = "TEXT", name = "title", nullable = false)
    private String title;

    /** first question of the hazard report. */
    @Column(columnDefinition = "TEXT", name = "question_one", nullable = false)
    private String questionOne;

    /** second question of the hazard report. */
    @Column(columnDefinition = "TEXT", name = "question_two", nullable = false)
    private String questionTwo;

    /** third question of the hazard report. */
    @Column(columnDefinition = "TEXT", name = "question_three", nullable = false)
    private String questionThree;

    /** fourth question of the hazard report. */
    @Column(columnDefinition = "TEXT", name = "question_four", nullable = false)
    private String questionFour;

    /** fifth question of the hazard report. */
    @Column(columnDefinition = "TEXT", name = "question_five", nullable = false)
    private String questionFive;

    /** sixth question of the hazard report. */
    @Column(name = "question_six", nullable = false)
    private LocalDateTime questionSix;

    /** True if the hazard is saved as a draft. */
    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE", name = "is_draft", nullable = false)
    private boolean isDraft;

    /** The priority of the hazard. */
    @Column(columnDefinition = "TINYINT", name = "priority")
    private int priority;

    /** The time when the hazard was resolved. null if the hazard is still active. */
    @Column(name = "action_complete")
    private LocalDateTime actionComplete;

    /** A boolean to indicate whether a signature is required for this hazard. Defaults to true. */
    @Column(columnDefinition = "BOOLEAN DEFAULT TRUE", name = "signature_required", nullable = false)
    private boolean signatureRequired;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
