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
import java.util.UUID;

/**
 * Represents a file uploaded by a user.
 * <p>
 * Stores the file's unique identifier, associated account, uploader,
 * filename, extension, and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilesTable {
    /** Named constant for file extension column length. */
    private static final int EXTENSION_LENGTH = 8;

    /**
     * File identifier (generated UUID).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "file_id")
    private UUID fileId;

    /**
     * Account that owns this file. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /**
     * Account that uploaded this file. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "account_id")
    private AccountTable createdBy;

    /** Filename of the uploaded file. */
    @Column(name = "name", nullable = false)
    private String name;

    /** Extemsion of the uploaded file. */
    @Column(name = "extension", length = EXTENSION_LENGTH, nullable = false)
    private String extension;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
