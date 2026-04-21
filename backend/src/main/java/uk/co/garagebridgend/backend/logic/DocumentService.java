package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.*;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.SendOutDocumentRequest;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.models.response.PendingSignatureResponse;
import uk.co.garagebridgend.backend.repository.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    /** Repository for accessing document data. */
    private final DocumentRepository documentRepository;

    /** Repository for accessing signature data. */
    private final SignatureRepository signatureRepository;

    /** Service for generating pre-signed URLs for files in storage. */
    private final StorageService storageService;

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /** Repository for accessing file data. */
    private final FilesRepository filesRepository;

    /** Repository for accessing account data. */
    private final AccountRepository accountRepository;

    /** Repository for managing document recipients. */
    private final DocumentRecipientRepository documentRecipientRepository;


    /**
     * Retrieves all documents for the currently authenticated user, including a pre-signed URL for each document's file
     * and whether the user has signed each document.
     *
     * @return list of DocumentResponse objects representing the documents for the authenticated user
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     */
    public List<DocumentResponse> getAllDocuments() throws AuthenticatedAccountNotFoundException {

        var account = authenticationService.getCurrentUser();

        return documentRepository.findAllByOrderByCreatedDesc()
                .stream()
                .filter(document -> documentRecipientRepository.existsByDocumentAndAccount(document, account))
                .map(document -> new DocumentResponse(
                        document.getDocumentId(),
                        document.getTitle(),
                        storageService.getObject(document.getFile().getFileId().toString()),
                        signatureRepository.existsByAccountAndDocument(account, document)
                ))
                .toList();
    }

    /**
     * Sign a document as the currently authenticated user.
     * @param documentId the ID of the document to sign
     */
    public void signDocument(final Long documentId) throws AuthenticatedAccountNotFoundException {
        var account = authenticationService.getCurrentUser();

        DocumentTable document = documentRepository.findById(documentId)
                .orElseThrow();

        // Don't create duplicate signatures
        if (signatureRepository.existsByAccountAndDocument(account, document)) {
            return;
        }

        SignatureTable signature = new SignatureTable();
        signature.setAccount(account);
        signature.setDocument(document);
        signatureRepository.save(signature);
    }

    /**
     * Uploads a new document and sends it out to all employees.
     * Accepts a base64-encoded PDF along with metadata (title, category, requireSignature).
     *
     * @param request the request containing document metadata and file content
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     * @throws IllegalArgumentException if the title does not meet category-specific rules
     */
    public void sendOutDocument(final SendOutDocumentRequest request)
            throws AuthenticatedAccountNotFoundException {

        var account = authenticationService.getCurrentUser();

        String title = request.getTitle().trim().replaceAll("(?i)\\.pdf$", "");

        switch (request.getCategory()) {
            case "sop" -> {
                if (!title.toUpperCase().startsWith("SOP")) {
                    title = "SOP: " + title;
                }
            }
            case "handbook" -> {
                if (!title.toLowerCase().contains("handbook")) {
                    throw new IllegalArgumentException(
                            "Handbook title must include the word 'handbook'."
                    );
                }
            }
            default -> {
            }
        }

        byte[] fileBytes = storageService.decodeBase64(request.getContent());

        FilesTable file = new FilesTable();
        file.setAccount(account);
        file.setCreatedBy(account);
        file.setName(title);
        file.setExtension("pdf");
        filesRepository.save(file);

        UUID fileId = file.getFileId();

        // Upload to MinIO using that ID
        storageService.uploadFile(
                fileId.toString(),
                new ByteArrayInputStream(fileBytes),
                "pdf"
        );

        DocumentTable document = new DocumentTable();
        document.setFile(file);
        document.setTitle(title);
        document.setSignatureRequired(request.isRequireSignature());
        documentRepository.save(document);

        // Resolve recipients — everyone if list is null/empty, otherwise specific accounts
        List<AccountTable> recipients;
        if (request.getRecipientIds() == null || request.getRecipientIds().isEmpty()) {
            recipients = accountRepository.findAll();
        } else {
            recipients = accountRepository.findAllById(request.getRecipientIds());
        }

        for (AccountTable recipient : recipients) {
            DocumentRecipientTable recipientRecord = new DocumentRecipientTable();
            recipientRecord.setDocument(document);
            recipientRecord.setAccount(recipient);
            documentRecipientRepository.save(recipientRecord);
        }
    }

    /**
     * Returns every (account, document) pair where:
     *  - the document requires a signature, AND
     *  - the account is a recipient of the document, AND
     *  - the account has NOT yet signed the document.
     * @return list of pending signature items, ordered by sentDate descending
     */
    public List<PendingSignatureResponse> getPendingSignatures() {

        // Find all documents that require a signature
        List<DocumentTable> signatureRequiredDocs =
                documentRepository.findAllBySignatureRequiredTrue();

        List<PendingSignatureResponse> pendingItems = new java.util.ArrayList<>();

        for (DocumentTable document : signatureRequiredDocs) {

            // Find everyone who received this document
            List<DocumentRecipientTable> recipients =
                    documentRecipientRepository.findAllByDocument(document);

            for (DocumentRecipientTable recipient : recipients) {
                AccountTable account = recipient.getAccount();

                // Check if this account has already signed
                boolean hasSigned = signatureRepository
                        .existsByAccountAndDocument(account, document);

                if (!hasSigned) {
                    pendingItems.add(new PendingSignatureResponse(
                            account.getAccountId(),
                            account.getFirstName() + " " + account.getLastName(),
                            document.getDocumentId(),
                            document.getTitle(),
                            recipient.getCreated()   // when the doc was sent to them
                    ));
                }
            }
        }

        // Sort by sentDate descending (most recently sent first)
        pendingItems.sort((a, b) -> b.getSentDate().compareTo(a.getSentDate()));

        return pendingItems;
    }
}
