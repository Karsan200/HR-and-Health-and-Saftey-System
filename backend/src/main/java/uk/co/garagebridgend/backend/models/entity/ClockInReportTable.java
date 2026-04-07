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
 * Represents a clock-in issue report submitted by an employee.
 * <p>
 * Stores the reporting account, the specific clock-in record being disputed,
 * the issue description, and the timestamp at which the report was submitted.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClockInReportTable {

    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    /**
     * Account that submitted this report. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false)
    private AccountTable account;

    /**
     * The specific clock-in record being disputed. References {@code clock_id}
     * in the clock_in_table.
     */
    @ManyToOne
    @JoinColumn(name = "clock_id", referencedColumnName = "clock_id", nullable = false)
    private ClockInTable clockIn;

    /** Description of the issue reported by the employee. */
    @Column(columnDefinition = "TEXT", name = "issue", nullable = false)
    private String issue;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}