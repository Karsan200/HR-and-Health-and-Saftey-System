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

import java.time.LocalDateTime;

/**
 * Entity representing a leave request made by an account. Contains details
 * about the type of leave, duration, approval status, and any notes or
 * responses related to the request.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveTable {
    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_id")
    private Long leaveId;

    /**
     * Account that owns this leave. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /** Type of leave. References {@code leave_type_id} in the leave type table. */
    @ManyToOne
    @JoinColumn(columnDefinition = "TINYINT", name = "leave_type_id",
            referencedColumnName = "leave_type_id", nullable = false
    )
    private LeaveTypeTable leaveType;

    /** Start date of the leave. */
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    /** End date of the leave. */
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    /** True if the leave is approved, false if it's pending or rejected. */
    @Column(name = "is_approved", nullable = false)
    private boolean isApproved;

    /** Notes left about this leave request. */
    @Column(columnDefinition = "TEXT", name = "notes")
    private String notes;

    /** Reason for rejection/approval - primary use for why a request is rejected. */
    @Column(columnDefinition = "TEXT", name = "response")
    private String response;

    /** Creation timestamp (auto-populated, not updatable). */
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
