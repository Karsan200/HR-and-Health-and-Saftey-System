package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentTable, Long> {
    // Count documents for a specific user
    int countByFile_Account(AccountTable account);
}