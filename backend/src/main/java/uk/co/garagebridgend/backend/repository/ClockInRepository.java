package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
 * Repository interface for finding lates to work for a specific week.
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
            @Param("lateThreshold") LocalTime lateThreshold,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    /**
     * Retrieves all clock-in records created on a given day across all accounts,
     * ordered by creation time ascending. Used by the admin overrides page to
     * display every employee's clock-in for a selected date.
     *
     * @param startOfDay the start of the target day (inclusive)
     * @param endOfDay   the end of the target day (inclusive)
     * @return all clock-in records for that day, ordered earliest first
     */
    @Query("""
        SELECT c
        FROM ClockInTable c
        WHERE c.created >= :startOfDay
          AND c.created <= :endOfDay
        ORDER BY c.created ASC
    """)
    List<ClockInTable> findAllForDate(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /**
     * Checks whether a clock-in record already exists for a specific account
     * on a given day. Used to prevent duplicate manual entries.
     *
     * @param accountId  the employee account id
     * @param startOfDay the start of the target day (inclusive)
     * @param endOfDay   the end of the target day (inclusive)
     * @return true if at least one record exists for that account on that day
     */
    @Query("""
        SELECT COUNT(c) > 0
        FROM ClockInTable c
        WHERE c.account.accountId = :accountId
          AND c.created >= :startOfDay
          AND c.created <= :endOfDay
    """)
    boolean existsByAccountAndDate(
            @Param("accountId") Long accountId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    /**
     * Overwrites the {@code created} timestamp on a specific clock-in record.
     * Used after an admin-created insert to backdate the record to the correct
     * date, bypassing the value stamped by {@code @CreationTimestamp}.
     *
     * @param clockId the UUID of the record to update
     * @param created the timestamp to set
     */
    @Modifying
    @Query("""
        UPDATE ClockInTable c
        SET c.created = :created
        WHERE c.clockInId = :clockId
    """)
    void backdateCreated(
            @Param("clockId") UUID clockId,
            @Param("created") LocalDateTime created
    );
}