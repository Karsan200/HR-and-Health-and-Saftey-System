package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;

/**
 * Repository for accessing clock-in report records.
 */
@Repository
public interface ClockInReportRepository extends JpaRepository<ClockInReportTable, Long> {
}
