package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
/**
 * Repository interface for finding late's to work for a specific week.
 */
@Repository
public interface ClockInRepository extends JpaRepository<ClockInTable, UUID> {

    /**
     * Finds all clock-in records for a given account, ordered by creation time descending.
     * @param account the account to find records for
     * @return list of clock-in records
     */
    List<ClockInTable> findByAccountOrderByCreatedDesc(AccountTable account);

    /**
     * Finds all clock-in records for a given account within a date range.
     * @param account the account to find records for
     * @param from the start of the date range (inclusive)
     * @param to the end of the date range (inclusive)
     * @return list of clock-in records within the range
     */
    List<ClockInTable> findByAccountAndCreatedBetweenOrderByCreatedDesc(
            AccountTable account,
            LocalDateTime from,
            LocalDateTime to
    );

    /**
     * Finds the most recent clock-in record for a given account.
     * @param account the account to find the most recent record for
     * @return an optional containing the most recent record, or empty if none exists
     */
    Optional<ClockInTable> findFirstByAccountOrderByCreatedDesc(AccountTable account);

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
            @Param("lateThreshold") LocalTime lateThreshold,
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
            LocalTime lateThreshold
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
    List<ClockInTable> findTop10LateClockIns(@Param("lateThreshold") LocalTime lateThreshold);
}
