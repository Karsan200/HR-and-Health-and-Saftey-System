package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import uk.co.garagebridgend.backend.models.entity.LeaveTable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for accessing leave records from the database.
 */
@Repository
public interface LeaveRepository extends JpaRepository<LeaveTable, Long> {

    /**
     * Retrieves all approved leave entries that overlap with a given day.
     *
     * @param startOfDay the start of the day (e.g. 00:00 of the selected date)
     * @param endOfDay the end of the day (e.g. 23:59:59 of the selected date)
     * @return a list of {@link LeaveTable} entries where the leave period overlaps
     *         with the specified day and the leave is approved
     */
    @Query("""
    SELECT l FROM LeaveTable l
    WHERE l.startDate <= :endOfDay
    AND l.endDate >= :startOfDay
    AND l.isApproved = true
    """)
    List<LeaveTable> findLeaveForDate(LocalDateTime startOfDay, LocalDateTime endOfDay);

    /**
     * Retrieves all approved leave entries that overlap with a given date range.
     * Used to fetch all leave visible within a calendar month view, including
     * leave that starts before or ends after the range boundaries.
     *
     * @param rangeStart the start of the date range to query against
     * @param rangeEnd the end of the date range to query against
     * @return a list of approved {@link LeaveTable} entries overlapping the range
     */
    @Query("""
    SELECT l FROM LeaveTable l
    WHERE l.startDate <= :rangeEnd
    AND l.endDate >= :rangeStart
    AND l.isApproved = true
    """)
    List<LeaveTable> findApprovedLeaveInRange(
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEnd") LocalDateTime rangeEnd
    );

    /**
     * Retrieves the most recent leave requests.
     *
     * @return the latest leave request records, ordered by created descending
     */
    List<LeaveTable> findTop5ByOrderByCreatedDesc();

    /**
     * Retrieves all leave entries that are pending approval (not yet approved).
     * Ordered by creation date ascending so the oldest request appears first.
     *
     * @return a list of pending {@link LeaveTable} entries
     */
    @Query("""
    SELECT l FROM LeaveTable l
    WHERE l.isApproved = false
    AND l.response IS NULL
    ORDER BY l.created ASC
    """)
    List<LeaveTable> findPendingLeave();

    /**
     * Retrieves upcoming approved leave entries for an employee, ordered by soonest start date.
     *
     * @param accountId the employee account id
     * @param currentDateTime the current date and time
     * @return upcoming approved leave entries
     */
    @Query("""
        SELECT l
        FROM LeaveTable l
        WHERE l.account.accountId = :accountId
          AND l.isApproved = true
          AND l.endDate >= :currentDateTime
        ORDER BY l.startDate ASC
    """)
    List<LeaveTable> findUpcomingApprovedLeaveForEmployee(
            @Param("accountId") Long accountId,
            @Param("currentDateTime") LocalDateTime currentDateTime
    );
}
