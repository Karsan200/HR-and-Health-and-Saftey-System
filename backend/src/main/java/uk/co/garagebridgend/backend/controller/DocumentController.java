package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DocumentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;

import java.util.List;

/**
 * REST controller exposing endpoints related to document operations.
 * Provides access to the currently authenticated user's documents and allows signing them.
 */
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    /** Service responsible for handling document-related operations. */
    private final DocumentService documentsService;

    /**
     * Endpoint to retrieve the list of documents for the currently authenticated user.
     * @return a list of {@link DocumentResponse} containing the user's documents with pre-signed URLs
     */
    @GetMapping
    public List<DocumentResponse> getDocuments() {

        try {
            return documentsService.getDocumentsForCurrentUser();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Endpoint to retrieve a specific document by its ID for the currently authenticated user.
     * @param id the ID of the document to retrieve
     * @return a {@link DocumentResponse} containing the document's details and pre-signed URL
     */
    @GetMapping("/{id}")
    public DocumentResponse getDocument(@PathVariable final Long id) {
        try {
            return documentsService.getDocumentForCurrentUser(id);
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Endpoint to sign a specific document by its ID for the currently authenticated user.
     * @param id the ID of the document to sign
     */
    @PostMapping("/{id}/sign")
    public void signDocument(@PathVariable final Long id) {

        try {

            documentsService.signDocument(id);

        } catch (AuthenticatedAccountNotFoundException e) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );

        } catch (Exception e) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

}
