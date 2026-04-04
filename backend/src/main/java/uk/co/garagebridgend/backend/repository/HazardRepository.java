package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for managing HazardTable entities.
 */
@Repository
public interface HazardRepository extends JpaRepository<HazardTable, Long> {

    /**
     * Counts the number of hazards associated with the given account.
     *
     * @param account the account to count hazards for
     * @return the number of hazards for the account
     */
    int countByAccount(AccountTable account);

    /** Finding the number of hazards that are not resolved.
     * @return the number of open hazards.
     * **/
    @Query("""
    SELECT COUNT(h)
    FROM HazardTable h
    WHERE h.actionComplete IS NULL
      AND h.isDraft = false
""")
    int countOpenHazards();

    /**
     * Retrieves all hazards that require a signature.
     *
     * @return a list of hazards where signatureRequired is true and actionComplete is null.
     */
    List<HazardTable> findAllBySignatureRequiredTrueAndActionCompleteIsNull();

    /**
     * Retrieves all hazards created between a given start and end date-times.
     *
     * @param startDateTime the start of the date-time range
     * @param endDateTime   the end of the date-time range
     * @return a list of non-draft hazards created within a given date range
     */
    @Query("""
    SELECT h
    FROM HazardTable h
    WHERE h.isDraft = false
      AND h.created >= :startDateTime
      AND h.created < :endDateTime
""")
    List<HazardTable> findAllNonDraftCreatedBetween(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );

    /**
     * Retrieves the most recent non-draft hazards.
     *
     * @return the latest non-draft hazards, ordered by created descending
     */
    @Query("""
    SELECT h
    FROM HazardTable h
    WHERE h.isDraft = false
    ORDER BY h.created DESC
""")
    List<HazardTable> findTop10RecentNonDraftHazards();
}
