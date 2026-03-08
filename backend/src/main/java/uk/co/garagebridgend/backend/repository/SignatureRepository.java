package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.SignatureTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

@Repository
public interface SignatureRepository extends JpaRepository<SignatureTable, Long> {
    // Count signatures for a specific user
    int countByAccount(AccountTable account);
}