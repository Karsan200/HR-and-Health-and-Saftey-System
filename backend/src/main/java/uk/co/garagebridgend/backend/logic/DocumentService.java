package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.SignatureTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

import java.util.List;

/**
 * Service class for handling document-related operations, such as retrieving documents for the authenticated user
 * and signing documents.
 */
@Service
@RequiredArgsConstructor
public class DocumentService {

    /** Repository for accessing document data. */
    private final DocumentRepository documentRepository;

    /** Repository for accessing account data. */
    private final AccountRepository accountRepository;

    /** Service for generating pre-signed URLs for files in storage. */
    private final StorageService storageService;

    /** Repository for accessing signature data. */
    private final SignatureRepository signatureRepository;

    /**
     * Retrieves all documents for the currently authenticated user,
     * each including a pre-signed URL to access the file.
     *
     * @return list of document responses for the authenticated user
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     */
    public List<DocumentResponse> getDocumentsForCurrentUser()
            throws AuthenticatedAccountNotFoundException {

        // Get the currently authenticated user
        var user = AuthenticationService.getCurrentUser();

        AccountTable account;

        if (user != null) {
            account = accountRepository
                    .findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        // Fetch all documents for this account and map to response objects
        return documentRepository
                .findByFileAccountOrderByCreatedDesc(account)
                .stream()
                .map(document -> {

                    boolean signed = signatureRepository
                            .existsByAccountAndDocument(account, document);

                    return new DocumentResponse(
                            document.getDocumentId(),
                            document.getTitle(),
                            storageService.getPresignedUrl(
                                    document.getFile().getFileId().toString()
                            ),
                            signed
                    );
                })
                .toList();
    }

    /**
     * Retrieves a specific document by its ID for the currently authenticated user,
     * including a pre-signed URL to access the file.
     *
     * @param documentId the ID of the document to retrieve
     * @return a document response containing the document's details and pre-signed URL
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     */
    public DocumentResponse getDocumentForCurrentUser(final Long documentId)
            throws AuthenticatedAccountNotFoundException {

        var user = AuthenticationService.getCurrentUser();

        AccountTable account;
        if (user != null) {
            account = accountRepository
                    .findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        var document = documentRepository.findById(documentId)
                .orElseThrow();

        if (!document.getFile().getAccount().equals(account)) {
            throw new RuntimeException("Unauthorized");
        }

        boolean signed = signatureRepository
                .existsByAccountAndDocument(account, document);

        return new DocumentResponse(
                document.getDocumentId(),
                document.getTitle(),
                storageService.getPresignedUrl(
                        document.getFile().getFileId().toString()
                ),
                signed
        );
    }

    /**
     * Signs a specific document by its ID for the currently authenticated user.
     *
     * @param documentId the ID of the document to sign
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     */
    public void signDocument(final Long documentId)
            throws AuthenticatedAccountNotFoundException {

        var user = AuthenticationService.getCurrentUser();

        AccountTable account;

        if (user != null) {
            account = accountRepository
                    .findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        DocumentTable document = documentRepository
                .findById(documentId)
                .orElseThrow();

        if (signatureRepository.existsByAccountAndDocument(account, document)) {
            return;
        }

        SignatureTable signature = new SignatureTable();

        signature.setAccount(account);
        signature.setDocument(document);

        signatureRepository.save(signature);
    }
}
