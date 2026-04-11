package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.QualificationService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.QualificationResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QualificationControllerTest {

    private final QualificationService qualificationService = mock(QualificationService.class);

    private final QualificationController qualificationController =
            new QualificationController(qualificationService);

    @Test
    void testGetQualificationsSuccess() throws Exception {

        List<QualificationResponse> mockResponse = List.of(
                new QualificationResponse("First Aid", "Emergency training", "url1")
        );

        when(qualificationService.getQualificationsForCurrentUser())
                .thenReturn(mockResponse);

        List<QualificationResponse> result =
                qualificationController.getQualifications();

        assertEquals(1, result.size());
        assertEquals("First Aid", result.get(0).getTitle());
    }

    @Test
    void testGetQualificationsUnauthorized() throws Exception {

        when(qualificationService.getQualificationsForCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> qualificationController.getQualifications()
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testGetQualificationsInternalServerError() throws Exception {

        when(qualificationService.getQualificationsForCurrentUser())
                .thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> qualificationController.getQualifications()
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }
}