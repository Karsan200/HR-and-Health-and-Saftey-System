package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.DrivingLicenceService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.DrivingLicenceResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DrivingLicenceControllerTest {

    private final DrivingLicenceService drivingLicenceService = mock(DrivingLicenceService.class);
    private final DrivingLicenceController controller =
            new DrivingLicenceController(drivingLicenceService);

    @Test
    void testGetDrivingLicenceSuccess() throws Exception {

        DrivingLicenceResponse mockResponse =
                new DrivingLicenceResponse("Driving Licence", "pdf", "url");

        when(drivingLicenceService.getDrivingLicenceForCurrentUser())
                .thenReturn(mockResponse);

        DrivingLicenceResponse result = controller.getDrivingLicence();

        assertEquals("Driving Licence", result.getTitle());
        assertEquals("pdf", result.getExtension());
        assertEquals("url", result.getUrl());
    }

    @Test
    void testAuthenticatedAccountNotFound() throws Exception {

        when(drivingLicenceService.getDrivingLicenceForCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> controller.getDrivingLicence()
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testDrivingLicenceNotFound() throws Exception {

        when(drivingLicenceService.getDrivingLicenceForCurrentUser())
                .thenThrow(new NotFoundException("No driving licence"));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> controller.getDrivingLicence()
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("No driving licence found.", exception.getReason());
    }

    @Test
    void testInternalServerError() throws Exception {

        when(drivingLicenceService.getDrivingLicenceForCurrentUser())
                .thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> controller.getDrivingLicence()
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error.", exception.getReason());
    }
}