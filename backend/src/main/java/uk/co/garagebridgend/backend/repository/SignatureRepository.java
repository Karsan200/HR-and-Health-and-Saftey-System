package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.SignatureTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;

/**
 * Repository for managing SignatureTable entities.
 */
@Repository
public interface SignatureRepository extends JpaRepository<SignatureTable, Long> {

    /**
     * Counts the number of signatures associated with the given account.
     *
     * @param account the account to count signatures for
     * @return the number of signatures for the account
     */
    int countByAccount(AccountTable account);

    boolean existsByAccountAndDocument(AccountTable account, DocumentTable document);
}
