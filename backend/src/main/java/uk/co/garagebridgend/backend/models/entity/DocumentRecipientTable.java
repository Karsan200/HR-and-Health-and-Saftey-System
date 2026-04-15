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

/**
 * Represents the relationship between a document and the accounts it was sent to.
 * <p>
 * When a document is sent to everyone, one record is created per account.
 * When sent to specific employees, only those accounts get a record.
 */
@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"document_id", "account_id"})
        }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentRecipientTable {

    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_recipient_id")
    private Long documentRecipientId;

    /**
     * Document that was sent. References {@code document_id} in the
     * document table.
     */
    @ManyToOne
    @JoinColumn(name = "document_id", referencedColumnName = "document_id", nullable = false)
    private DocumentTable document;

    /**
     * Account the document was sent to. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
