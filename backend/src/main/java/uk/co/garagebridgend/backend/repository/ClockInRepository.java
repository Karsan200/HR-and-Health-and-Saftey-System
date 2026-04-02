package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;

import java.sql.Time;
import java.time.LocalDateTime;
import java.util.UUID;
/**
 * Repository interface for finding late's to work for a specific week.
 */
@Repository
public interface ClockInRepository extends JpaRepository<ClockInTable, UUID> {

    /**
     * Counts the number of clock-ins that are considered late for the current week.
     *
     * @param lateThreshold The time after which a clock-in is considered late.
     * @param startOfWeek   The start of the current week.
     * @param endOfWeek     The end of the current week.
     * @return The count of late clock-ins for the current week.
     */
    @Query("""
        SELECT COUNT(c)
        FROM ClockInTable c
        WHERE c.clockInTime > :lateThreshold
          AND c.created >= :startOfWeek
          AND c.created < :endOfWeek
    """)
    int countLateClockInsThisWeek(
            @Param("lateThreshold") Time lateThreshold,
            @Param("startOfWeek") LocalDateTime startOfWeek,
            @Param("endOfWeek") LocalDateTime endOfWeek
    );
}
