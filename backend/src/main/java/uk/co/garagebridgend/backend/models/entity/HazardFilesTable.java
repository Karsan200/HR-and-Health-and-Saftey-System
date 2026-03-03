package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents the association between a hazard and a file.
 * <p>
 * Stores the hazard file's ID, associated hazard, and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HazardFilesTable {
    /**
     * Hazard file. (primary key).
     * Maps to {@code file_id}.
     */
    @Id
    @Column(name = "file_id")
    private UUID fileId;

    /**
     * File that contains the hazard file. References {@code file_id} in the
     * files table.
     */
    @MapsId
    @ManyToOne
    @JoinColumn(name = "file_id", referencedColumnName = "file_id")
    private FilesTable file;

    /** Hazard the file belongs to. References {@code hazard_id} in the hazard table. */
    @ManyToOne
    @JoinColumn(name = "hazard_id", referencedColumnName = "hazard_id", nullable = false)
    private HazardTable hazard;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
