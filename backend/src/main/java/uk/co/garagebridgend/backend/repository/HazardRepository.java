package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

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
    int countByActionCompleteIsNullAndDraftFalse();
}
