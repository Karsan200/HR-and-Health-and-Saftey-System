package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

@Repository
public interface HazardRepository extends JpaRepository<HazardTable, Long> {
    // Count hazards for a specific user
    int countByAccount(AccountTable account);
}