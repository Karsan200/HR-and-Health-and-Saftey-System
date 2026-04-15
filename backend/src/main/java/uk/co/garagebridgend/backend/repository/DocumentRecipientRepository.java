package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.DocumentRecipientTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;

import java.util.List;

public interface DocumentRecipientRepository extends JpaRepository<DocumentRecipientTable, Long> {

    /** Check whether a document was sent to a specific account. */
    boolean existsByDocumentAndAccount(DocumentTable document, AccountTable account);

    /** Get all recipient records for a given document. */
    List<DocumentRecipientTable> findAllByDocument(DocumentTable document);
}