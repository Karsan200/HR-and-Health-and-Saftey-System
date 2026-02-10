package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Permissions for a single account.
 * <p>
 * Records whether an account has admin/manager privileges, who (optionally)
 * assigned those permissions, and when the record was created.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PermissionsTable {
    /**
     * Account that owns these permissions (primary key).
     * Maps to {@code account_id}.
     */
    @Id
    @OneToOne
    @JoinColumn(
        name = "account_id",
        referencedColumnName = "account_id",
        nullable = false
    )
    private AccountTable account;

    /**
     * Account that assigned these permissions (optional).
     * Maps to {@code assigned_by}.
     */
    @ManyToOne
    @JoinColumn(name = "assigned_by", referencedColumnName = "account_id")
    private AccountTable assignedByAccount;


    /** True if the account has admin permissions. */
    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin;

    /** True if the account has manager permissions. */
    @Column(name = "is_manager", nullable = false)
    private boolean isManager;

    /** Creation timestamp (auto-populated, not updatable). */
    @Column(name = "created", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime created;
}
