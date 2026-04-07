package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;

import java.sql.Time;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
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

    /**
     * Retrieves all late clock-ins within a given date range.
     * This allows us to reuse this component for different weeks, months and years.
     *
     * @param startDateTime the inclusive start of the range
     * @param endDateTime the exclusive end of the range
     * @param lateThreshold the time after which a clock-in is considered late
     * @return a list of late clock-ins in the range
     */
    List<ClockInTable> findAllByCreatedGreaterThanEqualAndCreatedLessThanAndClockInTimeGreaterThan(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            Time lateThreshold
    );

    /**
     * Retrieves the most recent late clock-ins.
     *
     * @param lateThreshold the time after which a clock-in is considered late
     * @return the latest late clock-ins, ordered by created descending
     */
    @Query("""
    SELECT c
    FROM ClockInTable c
    WHERE c.clockInTime > :lateThreshold
    ORDER BY c.created DESC
""")
    List<ClockInTable> findTop10LateClockIns(@Param("lateThreshold") Time lateThreshold);

    /**
     * Retrieves all clock-ins for an employee within a given date range.
     *
     * @param accountId the employee account id
     * @param startDateTime inclusive start of the range
     * @param endDateTime exclusive end of the range
     * @return matching clock-ins
     */
    @Query("""
        SELECT c
        FROM ClockInTable c
        WHERE c.account.accountId = :accountId
          AND c.created >= :startDateTime
          AND c.created < :endDateTime
        ORDER BY c.created ASC
    """)
    List<ClockInTable> findAllForEmployeeWithinDateRange(
            @Param("accountId") Long accountId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * Counts late clock-ins for an employee within a given date range.
     *
     * @param accountId the employee account id
     * @param lateThreshold the time after which a clock-in is considered late
     * @param startDateTime inclusive start of the range
     * @param endDateTime exclusive end of the range
     * @return the number of late clock-ins
     */
    @Query("""
        SELECT COUNT(c)
        FROM ClockInTable c
        WHERE c.account.accountId = :accountId
          AND c.clockInTime > :lateThreshold
          AND c.created >= :startDateTime
          AND c.created < :endDateTime
    """)
    int countLateClockInsForEmployeeWithinDateRange(
            @Param("accountId") Long accountId,
            @Param("lateThreshold") Time lateThreshold,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );
}
