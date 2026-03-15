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

import java.util.UUID;

/**
 * Represents a payslip associated with an account.
 * <p>
 * Stores the payslip's associated file, year, month, and whether it's a
 * p60 or p45 document.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayslipsTable {
    /**
     * File that represents this payslip (primary key).
     * Maps to {@code file_id}.
     */
    @Id
    @Column(name = "file_id")
    private UUID fileId;

    /**
     * File that contains the payslip. References {@code file_id} in the
     * files table.
     */
    @MapsId
    @ManyToOne
    @JoinColumn(name = "file_id", referencedColumnName = "file_id")
    private FilesTable file;

    /** Year the payslip is for. */
    @Column(columnDefinition = "SMALLINT", name = "year", nullable = false)
    private Integer year;

    /** Month the payslip is for. */
    @Column(columnDefinition = "TINYINT", name = "month")
    private Integer month;

    /** True if the payslip is a p60 document. False if it's a P45. */
    @Column(name = "is_p_sixty", nullable = false)
    private boolean isPSixty;
}
