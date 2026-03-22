package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
     * Retrieves all approved leave entries that include the specified date.
     *
     * @param date the date to check against leave records
     * @return a list of {@link LeaveTable} entries where the date falls
     *         within the leave period and the leave is approved
     */
    @Query("""
    SELECT l FROM LeaveTable l
    WHERE l.startDate < :endOfDay
    AND l.endDate > :startOfDay
    AND l.isApproved = true
    """)
    List<LeaveTable> findLeaveForDate(LocalDateTime startOfDay, LocalDateTime endOfDay);
}
