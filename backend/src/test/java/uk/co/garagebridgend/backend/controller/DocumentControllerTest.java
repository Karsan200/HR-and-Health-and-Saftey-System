package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DocumentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.SendOutDocumentRequest;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.models.response.PendingSignatureResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentControllerTest {

    private final DocumentService documentService = mock(DocumentService.class);
    private final DocumentController documentController = new DocumentController(documentService);

    @Test
    void testGetAllDocumentsSuccess() throws Exception {

        List<DocumentResponse> mockDocs = List.of(
                new DocumentResponse(1L, "Contract", "url1", false)
        );

        when(documentService.getAllDocuments()).thenReturn(mockDocs);

        List<DocumentResponse> result = documentController.getAllDocuments();

        assertEquals(1, result.size());
        assertEquals("Contract", result.get(0).getTitle());
    }

    @Test
    void testGetAllDocumentsInternalServerError() throws Exception {

        when(documentService.getAllDocuments()).thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.getAllDocuments()
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    @Test
    void testSignDocumentSuccess() throws Exception {

        doNothing().when(documentService).signDocument(1L);

        assertDoesNotThrow(() -> documentController.signDocument(1L));

        verify(documentService).signDocument(1L);
    }

    @Test
    void testSignDocumentUnauthorized() throws Exception {

        doThrow(new AuthenticatedAccountNotFoundException())
                .when(documentService).signDocument(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.signDocument(1L)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testSignDocumentInternalServerError() throws Exception {

        doThrow(new RuntimeException())
                .when(documentService).signDocument(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.signDocument(1L)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    @Test
    void testSendOutDocumentSuccess() throws Exception {

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "policy", true, "base64content", List.of()
        );

        doNothing().when(documentService).sendOutDocument(request);

        assertDoesNotThrow(() -> documentController.sendOutDocument(request));

        verify(documentService).sendOutDocument(request);
    }

    @Test
    void testSendOutDocumentBadRequest() throws Exception {

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Missing Word", "handbook", false, "base64content", List.of()
        );

        doThrow(new IllegalArgumentException("Handbook title must include the word 'handbook'."))
                .when(documentService).sendOutDocument(request);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.sendOutDocument(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Handbook title must include the word 'handbook'.", exception.getReason());
    }

    @Test
    void testSendOutDocumentUnauthorized() throws Exception {

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "policy", true, "base64content", List.of()
        );

        doThrow(new AuthenticatedAccountNotFoundException())
                .when(documentService).sendOutDocument(request);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.sendOutDocument(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testSendOutDocumentInternalServerError() throws Exception {

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "policy", true, "base64content", List.of()
        );

        doThrow(new RuntimeException())
                .when(documentService).sendOutDocument(request);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.sendOutDocument(request)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    /**
     * Tests for the getPendingSignatures endpoint, covering both successful retrieval and internal server error scenarios.
     */
    @Test
    void testGetPendingSignaturesSuccess() {
        List<PendingSignatureResponse> mockResponse = List.of(
                new PendingSignatureResponse(1L, "John Doe", 10L, "Fire Safety Policy", java.time.LocalDateTime.now())
        );

        when(documentService.getPendingSignatures()).thenReturn(mockResponse);

        List<PendingSignatureResponse> result = documentController.getPendingSignatures();

        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getFullName());
        assertEquals("Fire Safety Policy", result.get(0).getDocumentTitle());
    }

    @Test
    void testGetPendingSignaturesInternalServerError() {
        when(documentService.getPendingSignatures()).thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> documentController.getPendingSignatures()
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }
}