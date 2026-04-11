package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;

/**
 * Repository for accessing clock-in report records.
 */
public interface ClockInReportRepository extends JpaRepository<ClockInReportTable, Long> {
}
