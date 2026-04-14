package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;

import java.util.Optional;

/**
 * Repository for accessing clock-in report records.
 */
@Repository
public interface ClockInReportRepository extends JpaRepository<ClockInReportTable, Long> {

    /**
     * Finds the most recent report filed against a specific clock-in record.
     * Used by the admin overrides page to attach report details to each clock-in row.
     *
     * @param clockIn the clock-in record to look up a report for
     * @return an optional containing the most recent report, or empty if none exists
     */
    @Query("""
        SELECT r FROM ClockInReportTable r
        WHERE r.clockIn = :clockIn
        ORDER BY r.created DESC
    """)
    Optional<ClockInReportTable> findMostRecentByClockIn(@Param("clockIn") ClockInTable clockIn);
}