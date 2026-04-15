package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.GenerationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/** Represents a clock-in record for an account.
 * <p>
 * Stores the clock-in and clock-out times, associated account, and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClockInTable {
    /**
     * Clock In identifier (generated UUID).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "clock_id")
    private UUID clockInId;

    /**
     * Account that owns this leave. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /** Clock in time. */
    @Column(name = "clock_in", nullable = false)
    private LocalTime clockInTime;

    /** Clock out time. */
    @Column(name = "clock_out")
    private LocalTime clockOutTime;

    /** Flag indicating if the clock-in time was adjusted by an admin. */
    @Column(columnDefinition = "bit NOT NULL DEFAULT 0", name = "is_admin_adjusted", nullable = false)
    private boolean isAdminAdjusted;

    /** Creation timestamp (auto-populated, not updatable). */
    @Column(columnDefinition = "DATETIME(6) NOT NULL DEFAULT NOW()", name = "created", nullable = false)
    private LocalDateTime created;
}
