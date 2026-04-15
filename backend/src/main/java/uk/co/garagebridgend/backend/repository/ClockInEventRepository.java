package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.entity.ClockInEventTable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for managing ClockInEventTable entities.
 */
@Repository
public interface ClockInEventRepository extends JpaRepository<ClockInEventTable, UUID> {
    /** Gets the number of clock-in events within a specified time range.
     *
     * @param accountId the ID of the account to filter by
     * @param startTime the start of the time range
     * @param endTime the end of the time range
     * @return the count of clock-in events in the specified time range
     */
    @Query(
        "SELECT COUNT(e) FROM ClockInEventTable e WHERE e.account.accountId = :accountId AND (e.created BETWEEN :startTime AND :endTime)"
    )
    long countByAccountAndTimeRange(
            @Param("accountId") Long accountId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /** Retrieves a list of distinct dates on which clock-in events occurred.
     *
     * @return a list of unique LocalDate values representing the dates of clock-in events
     */
    @Query("SELECT DISTINCT CAST(e.created AS LocalDate) FROM ClockInEventTable e")
    List<LocalDate> findDistinctDates();

    /** Retrieves all clock-in events for a specific account on a given date, ordered by creation time.
     *
     * @param date the date to filter events by
     * @param accountId the ID of the account to filter events by
     * @return a list of ClockInEventTable entries matching the specified date and account, ordered by creation time
     */
    @Query("""
    SELECT e FROM ClockInEventTable e
    WHERE CAST(e.created AS LocalDate) = :date
    AND e.account.accountId = :accountId
    ORDER BY e.created ASC
    """)
    List<ClockInEventTable> findByDateAndAccount(
            @Param("date") LocalDate date,
            @Param("accountId") Long accountId
    );

    @Modifying
    @Transactional
    @Query("""
    DELETE FROM ClockInEventTable e
    WHERE CAST(e.created AS LocalDate) = :date
    AND e.account.accountId = :accountId
    """)
    void deleteByDateAndAccountId(
            @Param("date") LocalDate date,
            @Param("accountId") Long accountId
    );
}
