package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.RiskAssessmentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.HazardReportResponse;
import uk.co.garagebridgend.backend.models.response.HazardResponse;
import uk.co.garagebridgend.backend.models.response.RiskAssessmentResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RiskAssessmentControllerTest {

    private final RiskAssessmentService riskAssessmentService = mock(RiskAssessmentService.class);
    private final RiskAssessmentController riskAssessmentController =
            new RiskAssessmentController(riskAssessmentService);

    @Test
    void testGetAllRiskAssessmentsSuccess() {
        List<RiskAssessmentResponse> mockResponse = List.of(
                new RiskAssessmentResponse(1L, "Fire Safety", 3, 2, LocalDateTime.now(), false, false),
                new RiskAssessmentResponse(2L, "Chemical Handling", 5, 5, LocalDateTime.now(), true, true)
        );

        when(riskAssessmentService.getAllRiskAssessments()).thenReturn(mockResponse);

        List<RiskAssessmentResponse> result = riskAssessmentController.getAllRiskAssessments();

        assertEquals(2, result.size());
        assertEquals("Fire Safety", result.get(0).getTitle());
        assertEquals("Chemical Handling", result.get(1).getTitle());
    }

    @Test
    void testGetAllRiskAssessmentsInternalServerError() {
        when(riskAssessmentService.getAllRiskAssessments()).thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.getAllRiskAssessments()
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Failed to retrieve risk assessments", exception.getReason());
    }

    @Test
    void testGetHazardsForRiskAssessmentSuccess() {
        List<HazardResponse> mockHazards = List.of(
                new HazardResponse(1L, "Slippery Floor", "John Doe", false, false, LocalDateTime.now(), true),
                new HazardResponse(2L, "Exposed Wiring", "Jane Doe", true, false, LocalDateTime.now(), false)
        );

        when(riskAssessmentService.getHazardsForRiskAssessment(1L)).thenReturn(mockHazards);

        List<HazardResponse> result = riskAssessmentController.getHazardsForRiskAssessment(1L);

        assertEquals(2, result.size());
        assertEquals("Slippery Floor", result.get(0).getTitle());
        assertEquals("Exposed Wiring", result.get(1).getTitle());
    }

    @Test
    void testGetHazardsForRiskAssessmentNotFound() {
        when(riskAssessmentService.getHazardsForRiskAssessment(99L))
                .thenThrow(new NoSuchElementException("Risk assessment not found"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.getHazardsForRiskAssessment(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Risk assessment not found", exception.getReason());
    }

    @Test
    void testGetHazardsForRiskAssessmentUnauthorized() {
        when(riskAssessmentService.getHazardsForRiskAssessment(1L))
                .thenThrow(new AuthenticatedAccountNotFoundException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.getHazardsForRiskAssessment(1L)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    void testGetHazardsForRiskAssessmentInternalServerError() {
        when(riskAssessmentService.getHazardsForRiskAssessment(1L))
                .thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.getHazardsForRiskAssessment(1L)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Failed to retrieve hazards", exception.getReason());
    }

    @Test
    void testGetHazardByIdSuccess() {
        HazardReportResponse mockReport = new HazardReportResponse(
                1L, "Gas Leak", "What is the hazard?", "Who is affected?",
                "Controls in place", "Further actions", "John Doe",
                LocalDateTime.now(), false, false, "Jane Smith",
                LocalDateTime.now(), List.of("https://example.com/file1.jpg")
        );

        when(riskAssessmentService.getHazardById(1L)).thenReturn(mockReport);

        HazardReportResponse result = riskAssessmentController.getHazardById(1L);

        assertEquals(1L, result.getHazardId());
        assertEquals("Gas Leak", result.getTitle());
        assertEquals(1, result.getFileUrls().size());
    }

    @Test
    void testGetHazardByIdNotFound() {
        when(riskAssessmentService.getHazardById(99L))
                .thenThrow(new NoSuchElementException("Hazard not found"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.getHazardById(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Hazard not found", exception.getReason());
    }

    @Test
    void testGetHazardByIdInternalServerError() {
        when(riskAssessmentService.getHazardById(1L))
                .thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.getHazardById(1L)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Failed to retrieve hazard", exception.getReason());
    }

    @Test
    void testGetMyDraftHazardsSuccess() {
        List<HazardResponse> mockDrafts = List.of(
                new HazardResponse(1L, "Draft Hazard", "John Doe", true, false, LocalDateTime.now(), true)
        );

        when(riskAssessmentService.getMyDraftHazards()).thenReturn(mockDrafts);

        List<HazardResponse> result = riskAssessmentController.getMyDraftHazards();

        assertEquals(1, result.size());
        assertTrue(result.get(0).isDraft());
        assertTrue(result.get(0).isOwnedByCurrentUser());
    }

    @Test
    void testGetMyDraftHazardsReturnsEmpty() {
        when(riskAssessmentService.getMyDraftHazards()).thenReturn(List.of());

        List<HazardResponse> result = riskAssessmentController.getMyDraftHazards();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testMarkActionCompleteSuccess() {
        doNothing().when(riskAssessmentService).markActionComplete(1L);

        ResponseEntity<Void> result = riskAssessmentController.markActionComplete(1L);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        verify(riskAssessmentService).markActionComplete(1L);
    }

    @Test
    void testMarkActionCompleteNotFound() {
        doThrow(new NoSuchElementException("Hazard not found"))
                .when(riskAssessmentService).markActionComplete(99L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.markActionComplete(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Hazard not found", exception.getReason());
    }

    @Test
    void testMarkActionCompleteInternalServerError() {
        doThrow(new RuntimeException())
                .when(riskAssessmentService).markActionComplete(1L);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> riskAssessmentController.markActionComplete(1L)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Failed to mark action complete", exception.getReason());
    }
}