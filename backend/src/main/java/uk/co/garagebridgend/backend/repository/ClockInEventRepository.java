package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInEventTable;

import java.time.LocalDateTime;
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
    long countByEventTimeBetween(Long accountId, LocalDateTime startTime, LocalDateTime endTime);
}
