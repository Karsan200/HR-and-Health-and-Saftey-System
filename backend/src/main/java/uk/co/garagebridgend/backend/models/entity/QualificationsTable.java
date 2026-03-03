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
 * Represents a qualification associated with an account.
 * <p>
 * Stores the qualification's title, details, associated file (optional),
 * and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QualificationsTable {
    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "qualification_id")
    private Long qualificationId;

    /**
     * Account that owns this qualification. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /**
     * File that proves the qualification is real. References {@code file_id} in the
     * files table.
     */
    @ManyToOne
    @JoinColumn(name = "file_id", referencedColumnName = "file_id", nullable = true)
    private FilesTable file;

    /** Title of the qualification. */
    @JoinColumn(name = "title", nullable = false)
    private String title;

    /** Description of the qualification. */
    @JoinColumn(name = "details", nullable = false)
    private String details;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
