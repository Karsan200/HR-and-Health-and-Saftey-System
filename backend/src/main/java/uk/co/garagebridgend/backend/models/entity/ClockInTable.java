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
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Time;
import java.time.LocalDateTime;
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
    private Time clockInTime;

    /** Clock out time. */
    @Column(name = "clock_out")
    private Time clockOutTime;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
