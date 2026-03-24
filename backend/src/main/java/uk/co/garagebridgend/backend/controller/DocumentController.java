package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DocumentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}