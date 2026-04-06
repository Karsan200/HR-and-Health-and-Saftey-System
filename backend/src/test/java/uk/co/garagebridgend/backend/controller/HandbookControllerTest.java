package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import uk.co.garagebridgend.backend.logic.DocumentService;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HandbookControllerTest {

    private final DocumentService documentService = mock(DocumentService.class);

    private final HandbookController handbookController =
            new HandbookController(documentService);

    @Test
    void testGetHandbooksFiltersCorrectly() {

        List<DocumentResponse> mockDocuments = List.of(
                new DocumentResponse(1L, "Employee Handbook", "url1", false),
                new DocumentResponse(2L, "Company Policy", "url2", false),
                new DocumentResponse(3L, "Safety Handbook", "url3", false)
        );

        when(documentService.getAllDocuments()).thenReturn(mockDocuments);

        List<DocumentResponse> result = handbookController.getHandbooks();

        assertEquals(2, result.size());
        assertEquals("Employee Handbook", result.get(0).getTitle());
        assertEquals("Safety Handbook", result.get(1).getTitle());
    }

    @Test
    void testGetHandbooksCaseInsensitive() {

        List<DocumentResponse> mockDocuments = List.of(
                new DocumentResponse(1L, "employee handbook", "url1", false),
                new DocumentResponse(2L, "HANDBOOK GUIDE", "url2", false)
        );

        when(documentService.getAllDocuments()).thenReturn(mockDocuments);

        List<DocumentResponse> result = handbookController.getHandbooks();

        assertEquals(2, result.size());
    }

    @Test
    void testGetHandbooksReturnsEmptyList() {

        List<DocumentResponse> mockDocuments = List.of(
                new DocumentResponse(1L, "Company Policy", "url1", false),
                new DocumentResponse(2L, "Workplace Rules", "url2", false)
        );

        when(documentService.getAllDocuments()).thenReturn(mockDocuments);

        List<DocumentResponse> result = handbookController.getHandbooks();

        assertTrue(result.isEmpty());
    }
}