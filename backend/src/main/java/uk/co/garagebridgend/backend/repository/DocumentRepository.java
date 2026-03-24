package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

import java.util.List;

/**
 * Repository interface for DocumentTable entity.
 */
@Repository
public interface DocumentRepository extends JpaRepository<DocumentTable, Long> {
    /**
     * Counts the number of documents associated with the given account via files.
     *
     * @param account the account to count documents for
     * @return the number of documents for the account
     */
    int countByFileAccount(AccountTable account);

    /**
     * Retrieves a list of documents associated with the given account, ordered by creation date in descending order.
     *
     * @param account the account to retrieve documents for
     * @return a list of documents for the account, ordered by creation date descending
     */
    List<DocumentTable> findByFileAccountOrderByCreatedDesc(AccountTable account);
}
