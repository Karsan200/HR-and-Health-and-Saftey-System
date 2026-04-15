package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.DocumentRecipientTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;

import java.util.List;

public interface DocumentRecipientRepository extends JpaRepository<DocumentRecipientTable, Long> {

    /**
     * Checks if a record exists for the given document and account,
     * indicating whether the document was sent to that account.
     * @param document
     * @param account
     * @return true if a record exists for the given document and account, false otherwise
     */
    boolean existsByDocumentAndAccount(DocumentTable document, AccountTable account);

    /**
     * Finds all document recipient records for a given document, returning a list of accounts the document was sent to.
     * @param document
     * @return list of DocumentRecipientTable records for the given document
     */
    List<DocumentRecipientTable> findAllByDocument(DocumentTable document);
}
