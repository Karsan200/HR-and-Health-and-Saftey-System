package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.entity.SignatureTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.SendOutDocumentRequest;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.FilesRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

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
                .map(document -> new DocumentResponse(
                        document.getDocumentId(),
                        document.getTitle(),
                        storageService.getPresignedUrl(document.getFile().getFileId().toString()),
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

        // Strip trailing .pdf from the title
        String title = request.getTitle().trim().replaceAll("(?i)\\.pdf$", "");

        // Apply category-specific title rules
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
            default -> { /* policy — no transformation needed */ }
        }

        // Decode the base64 file content
        byte[] fileBytes = storageService.decodeBase64(request.getContent());

        // Persist the FilesTable record FIRST (like hazard service)
        FilesTable file = new FilesTable();
        file.setAccount(account);
        file.setCreatedBy(account);
        file.setName(title);
        file.setExtension("pdf");

        filesRepository.save(file);

        // NOW get the generated ID
        UUID fileId = file.getFileId();

        // Upload to MinIO using that ID REMEMBER TO UNCOMMENT THIS BEFORE MERGE
//        storageService.uploadFile(
//                fileId.toString(),
//                new ByteArrayInputStream(fileBytes),
//                "pdf"
//        );

        // Persist the DocumentTable record
        DocumentTable document = new DocumentTable();
        document.setFile(file);
        document.setTitle(title);
        document.setSignatureRequired(request.isRequireSignature());
        documentRepository.save(document);
    }
}
