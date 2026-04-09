package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.AdminDashboardService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.AdminDashboardChartPointResponse;
import uk.co.garagebridgend.backend.models.response.AdminDashboardSummaryResponse;
import uk.co.garagebridgend.backend.models.response.AdminDocumentSignaturesChartResponse;
import uk.co.garagebridgend.backend.models.response.AdminHazardsReportedChartResponse;
import uk.co.garagebridgend.backend.models.response.AdminLateArrivalsChartResponse;
import uk.co.garagebridgend.backend.models.response.AdminRecentActivityItemResponse;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminDashboardControllerTest {

    private final AdminDashboardService adminDashboardService = mock(AdminDashboardService.class);

    private final AdminDashboardController adminDashboardController =
            new AdminDashboardController(adminDashboardService);

    @Test
    void testGetAdminDashboardSummarySuccess() {

        // Given a summary response from the service
        AdminDashboardSummaryResponse mockResponse =
                new AdminDashboardSummaryResponse(7, 3, 2);

        when(adminDashboardService.getAdminDashboardSummary()).thenReturn(mockResponse);

        // When the controller summary endpoint is called
        AdminDashboardSummaryResponse result = adminDashboardController.getAdminDashboardSummary();

        // Then the response should be returned unchanged
        assertEquals(7, result.getPendingSignatures());
        assertEquals(3, result.getLateThisWeek());
        assertEquals(2, result.getOpenHazards());
    }

    @Test
    void testGetAdminDashboardSummaryUnauthorized() {

        // Given the service throws because the authenticated account cannot be found
        when(adminDashboardService.getAdminDashboardSummary())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When the controller summary endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                adminDashboardController::getAdminDashboardSummary
        );

        // Then the controller should return HTTP 401
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testGetAdminDashboardSummaryInternalServerError() {

        // Given the service throws an unexpected runtime exception
        when(adminDashboardService.getAdminDashboardSummary())
                .thenThrow(new RuntimeException("boom"));

        // When the controller summary endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                adminDashboardController::getAdminDashboardSummary
        );

        // Then the controller should return HTTP 500 with the expected message
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal sever error boom", exception.getReason());
    }

    @Test
    void testGetLateArrivalsChartSuccess() {

        // Given the service returns chart data for late arrivals
        AdminLateArrivalsChartResponse mockResponse =
                new AdminLateArrivalsChartResponse(
                        "this-week",
                        2,
                        List.of(
                                new AdminDashboardChartPointResponse("Mon", 1),
                                new AdminDashboardChartPointResponse("Tue", 1)
                        )
                );

        when(adminDashboardService.getLateArrivalsChart("this-week"))
                .thenReturn(mockResponse);

        // When the controller endpoint is called
        AdminLateArrivalsChartResponse result =
                adminDashboardController.getLateArrivalsChart("this-week");

        // Then the chart response should be returned correctly
        assertEquals("this-week", result.getRange());
        assertEquals(2, result.getTotal());
        assertEquals(2, result.getPoints().size());
    }

    @Test
    void testGetLateArrivalsChartBadRequest() {

        // Given the service rejects the supplied range
        when(adminDashboardService.getLateArrivalsChart("invalid"))
                .thenThrow(new IllegalArgumentException("Unsupported range: invalid"));

        // When the controller endpoint is called with an invalid range
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminDashboardController.getLateArrivalsChart("invalid")
        );

        // Then the controller should return HTTP 400
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Unsupported range: invalid", exception.getReason());
    }

    @Test
    void testGetLateArrivalsChartInternalServerError() {

        // Given the service throws an unexpected exception
        when(adminDashboardService.getLateArrivalsChart("this-week"))
                .thenThrow(new RuntimeException());

        // When the controller endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminDashboardController.getLateArrivalsChart("this-week")
        );

        // Then the controller should return HTTP 500
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    @Test
    void testGetDocumentSignaturesChartSuccess() {

        // Given the service returns document signatures totals
        AdminDocumentSignaturesChartResponse mockResponse =
                new AdminDocumentSignaturesChartResponse(5, 4);

        when(adminDashboardService.getDocumentSignaturesChart("this-month"))
                .thenReturn(mockResponse);

        // When the controller endpoint is called
        AdminDocumentSignaturesChartResponse result =
                adminDashboardController.getDocumentSignaturesChart("this-month");

        // Then the response should contain the expected totals
        assertEquals(5, result.getSigned());
        assertEquals(4, result.getPending());
    }

    @Test
    void testGetDocumentSignaturesChartBadRequest() {

        // Given the service rejects the supplied range
        when(adminDashboardService.getDocumentSignaturesChart("invalid"))
                .thenThrow(new IllegalArgumentException("Unsupported range: invalid"));

        // When the controller endpoint is called with an invalid range
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminDashboardController.getDocumentSignaturesChart("invalid")
        );

        // Then the controller should return HTTP 400
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Unsupported range: invalid", exception.getReason());
    }

    @Test
    void testGetDocumentSignaturesChartInternalServerError() {

        // Given the service throws an unexpected exception
        when(adminDashboardService.getDocumentSignaturesChart("this-month"))
                .thenThrow(new RuntimeException());

        // When the controller endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminDashboardController.getDocumentSignaturesChart("this-month")
        );

        // Then the controller should return HTTP 500
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    @Test
    void testGetHazardsReportedChartSuccess() {

        // Given the service returns chart data for hazards reported
        AdminHazardsReportedChartResponse mockResponse =
                new AdminHazardsReportedChartResponse(
                        "this-week",
                        3,
                        List.of(
                                new AdminDashboardChartPointResponse("Mon", 1),
                                new AdminDashboardChartPointResponse("Tue", 2)
                        )
                );

        when(adminDashboardService.getHazardsReportedChart("this-week"))
                .thenReturn(mockResponse);

        // When the controller endpoint is called
        AdminHazardsReportedChartResponse result =
                adminDashboardController.getHazardsReportedChart("this-week");

        // Then the chart response should be returned correctly
        assertEquals("this-week", result.getRange());
        assertEquals(3, result.getTotal());
        assertEquals(2, result.getPoints().size());
    }

    @Test
    void testGetHazardsReportedChartBadRequest() {

        // Given the service rejects the supplied range
        when(adminDashboardService.getHazardsReportedChart("invalid"))
                .thenThrow(new IllegalArgumentException("Unsupported range: invalid"));

        // When the controller endpoint is called with an invalid range
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminDashboardController.getHazardsReportedChart("invalid")
        );

        // Then the controller should return HTTP 400
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Unsupported range: invalid", exception.getReason());
    }

    @Test
    void testGetHazardsReportedChartInternalServerError() {

        // Given the service throws an unexpected exception
        when(adminDashboardService.getHazardsReportedChart("this-week"))
                .thenThrow(new RuntimeException("boom"));

        // When the controller endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminDashboardController.getHazardsReportedChart("this-week")
        );

        // Then the controller should return HTTP 500 with the expected message
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error boom", exception.getReason());
    }

    @Test
    void testGetRecentActivitySuccess() {

        // Given the service returns recent activity items
        List<AdminRecentActivityItemResponse> mockResponse = List.of(
                new AdminRecentActivityItemResponse(
                        "DOCUMENT_SIGNED",
                        "John Doe signed Safety Policy",
                        LocalDateTime.now()
                )
        );

        when(adminDashboardService.getRecentActivity()).thenReturn(mockResponse);

        // When the controller endpoint is called
        List<AdminRecentActivityItemResponse> result =
                adminDashboardController.getRecentActivity();

        // Then the recent activity should be returned unchanged
        assertEquals(1, result.size());
        assertEquals("DOCUMENT_SIGNED", result.getFirst().getType());
        assertEquals("John Doe signed Safety Policy", result.getFirst().getMessage());
    }

    @Test
    void testGetRecentActivityInternalServerError() {

        // Given the service throws an unexpected exception
        when(adminDashboardService.getRecentActivity())
                .thenThrow(new RuntimeException("boom"));

        // When the controller endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                adminDashboardController::getRecentActivity
        );

        // Then the controller should return HTTP 500 with the expected message
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error boom", exception.getReason());
    }
}
