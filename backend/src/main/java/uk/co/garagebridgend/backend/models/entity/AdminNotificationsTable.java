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
 * Represents an administrative notification for a user.
 * <p>
 * Stores the notification's title, description, priority, acknowledgment status,
 * and creation timestamp. Linked to an account.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminNotificationsTable {
    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_notification_id")
    private Long adminNotificationId;

    /**
     * Account associated with these notifications. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /** Title of the notification. */
    @Column(columnDefinition = "TEXT", name = "title", nullable = false)
    private String title;

    /** Description of the notification. */
    @Column(columnDefinition = "TEXT", name = "description", nullable = false)
    private String description;

    /** True if the notification has been read by the user. */
    @Column(name = "is_acknowledged", nullable = false)
    private boolean isAcknowledged;

    /** The priority of the notification. */
    @Column(columnDefinition = "TINYINT", name = "priority", nullable = false)
    private int priority;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
