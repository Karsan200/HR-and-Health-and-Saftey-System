package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DocumentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.SendOutDocumentRequest;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.models.response.PendingSignatureResponse;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    /** Logger for logging document-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(DocumentController.class);


    /** Service responsible for handling document-related operations. */
    private final DocumentService documentService;


    /**
     * @return a list of {@link DocumentResponse} containing the user's documents with pre-signed URLs
     */
    @GetMapping
    public List<DocumentResponse> getAllDocuments() {
        try {
            return documentService.getAllDocuments();
        } catch (Exception e) {
            LOG.error("Error retrieving documents", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    /**
     * Endpoint to sign a specific document by its ID for the currently authenticated user.
     * @param id the ID of the document to sign
     */
    @PostMapping("/{id}/sign")
    public void signDocument(@PathVariable final Long id) {
        try {
            documentService.signDocument(id);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated account not found.");
        } catch (Exception e) {
            LOG.error("Error signing document with ID: {}", id, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    /**
     * Uploads a new document and sends it out to all employees.
     * Accepts a base64-encoded PDF along with metadata (title, category, requireSignature).
     * @param request the request body containing document metadata and file content
     */
    @PostMapping("/admin/send-out")
    public void sendOutDocument(@RequestBody final SendOutDocumentRequest request) {
        try {
            documentService.sendOutDocument(request);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated account not found.");
        } catch (Exception e) {
            LOG.error("Error sending out document", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    /**
     * Returns all (account, document) pairs where a signature is required but.
     * has not yet been provided.*
     * @return list of {@link PendingSignatureResponse} items
     */
    @GetMapping("/admin/pending-signatures")
    public List<PendingSignatureResponse> getPendingSignatures() {
        try {
            return documentService.getPendingSignatures();
        } catch (Exception e) {
            LOG.error("Error retrieving pending signatures", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }
}
