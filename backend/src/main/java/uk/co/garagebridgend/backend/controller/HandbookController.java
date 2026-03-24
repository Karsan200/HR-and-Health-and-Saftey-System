package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.co.garagebridgend.backend.logic.DocumentService;
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
     * Retrieves all documents that are classified as handbooks.
     * Filters documents based on the presence of "handbook" in their title.
     *
     * @return a list of {@link DocumentResponse} objects representing handbook documents
     */
    @GetMapping
    public List<DocumentResponse> getHandbooks() {
        List<DocumentResponse> allDocuments = documentService.getAllDocuments();
        return allDocuments.stream()
                .filter(doc -> doc.getTitle().toLowerCase().contains("handbook"))
                .collect(Collectors.toList());
    }
}