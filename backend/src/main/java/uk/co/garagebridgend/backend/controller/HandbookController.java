package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DocumentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller exposing endpoints for handbook PDFs.
 */
@RestController
@RequestMapping("/api/handbooks")
@RequiredArgsConstructor
public class HandbookController {

    /** Service responsible for handling document-related operations. */
    private final DocumentService documentService;

    /**
     * Retrieves all handbook documents for the current user.
     * Only documents with "handbook" in the title are returned.
     *
     * @return list of DocumentResponse objects for handbooks
     */
    @GetMapping
    public List<DocumentResponse> getHandbooks() {
        try {
            List<DocumentResponse> allDocuments = documentService.getDocumentsForCurrentUser();

            // Filter documents where title contains "handbook"
            return allDocuments.stream()
                    .filter(doc -> doc.getTitle().toLowerCase().contains("handbook"))
                    .collect(Collectors.toList());

        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated account not found.");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}
