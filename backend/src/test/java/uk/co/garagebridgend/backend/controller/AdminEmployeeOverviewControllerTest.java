package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.AdminEmployeeOverviewService;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeListItemResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeOverviewResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeUpcomingLeaveResponse;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminEmployeeOverviewControllerTest {

    private final AdminEmployeeOverviewService adminEmployeeOverviewService =
            mock(AdminEmployeeOverviewService.class);

    private final AdminEmployeeOverviewController adminEmployeeOverviewController =
            new AdminEmployeeOverviewController(adminEmployeeOverviewService);

    @Test
    void testGetEmployeesSuccessWithNullSearch() {

        // Given no search has taken place and the service returns a list of all employees
        List<AdminEmployeeListItemResponse> mockResponse = List.of(
                new AdminEmployeeListItemResponse(1L, "John Doe", "Admin"),
                new AdminEmployeeListItemResponse(2L, "Maggie May", "Employee")
        );

        when(adminEmployeeOverviewService.getEmployees(null)).thenReturn(mockResponse);

        // When the controller employee list endpoint is called
        List<AdminEmployeeListItemResponse> result =
                adminEmployeeOverviewController.getEmployees(null);

        // Then the response should be returned unchanged
        assertEquals(2, result.size());
        assertEquals(1L, result.getFirst().getAccountId());
        assertEquals("John Doe", result.get(0).getFullName());
        assertEquals("Admin", result.get(0).getPosition());
        assertEquals(2L, result.get(1).getAccountId());
        assertEquals("Maggie May", result.get(1).getFullName());
        assertEquals("Employee", result.get(1).getPosition());
    }

    @Test
    void testGetEmployeesSuccessWithSearch() {

        // Given the service returns a filtered list for the supplied search
        List<AdminEmployeeListItemResponse> mockResponse = List.of(
                new AdminEmployeeListItemResponse(3L, "Maggie May", "Manager")
        );

        when(adminEmployeeOverviewService.getEmployees("Maggie")).thenReturn(mockResponse);

        // When the controller employee list endpoint is called with a search value
        List<AdminEmployeeListItemResponse> result =
                adminEmployeeOverviewController.getEmployees("Maggie");

        // Then the filtered response should be returned unchanged
        assertEquals(1, result.size());
        assertEquals(3L, result.getFirst().getAccountId());
        assertEquals("Maggie May", result.getFirst().getFullName());
        assertEquals("Manager", result.getFirst().getPosition());
    }

    @Test
    void testGetEmployeesInternalServerError() {

        // Given the service throws an unexpected exception
        when(adminEmployeeOverviewService.getEmployees("john"))
                .thenThrow(new RuntimeException("unexpected error"));

        // When the controller employee list endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminEmployeeOverviewController.getEmployees("john")
        );

        // Then the controller should return HTTP 500
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    @Test
    void testGetEmployeeOverviewSuccess() {

        // Given the service returns an overview for the requested employee
        AdminEmployeeOverviewResponse mockResponse = new AdminEmployeeOverviewResponse(
                7L,
                "John Doe",
                "Admin",
                "john.doe@test.com",
                123.5,
                2,
                new AdminEmployeeUpcomingLeaveResponse(
                        "Annual Leave",
                        LocalDateTime.of(2026, 5, 1, 8, 0),
                        LocalDateTime.of(2026, 5, 2, 17, 0)
                )
        );

        when(adminEmployeeOverviewService.getEmployeeOverview(7L)).thenReturn(mockResponse);

        // When the controller employee overview endpoint is called
        AdminEmployeeOverviewResponse result =
                adminEmployeeOverviewController.getEmployeeOverview(7L);

        // Then the overview should be returned unchanged
        assertEquals(7L, result.getAccountId());
        assertEquals("John Doe", result.getFullName());
        assertEquals("Admin", result.getPosition());
        assertEquals("john.doe@test.com", result.getEmail());
        assertEquals(123.5, result.getHoursWorkedThisMonth());
        assertEquals(2, result.getLatesThisMonth());
        assertNotNull(result.getUpcomingLeave());
        assertEquals("Annual Leave", result.getUpcomingLeave().getLeaveType());
    }

    @Test
    void testGetEmployeeOverviewNotFound() {

        // Given the service cannot find the requested employee
        when(adminEmployeeOverviewService.getEmployeeOverview(99L))
                .thenThrow(new NotFoundException("Employee not found."));

        // When the controller employee overview endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminEmployeeOverviewController.getEmployeeOverview(99L)
        );

        // Then the controller should return HTTP 404 with the service message
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Employee not found.", exception.getReason());
    }

    @Test
    void testGetEmployeeOverviewInternalServerError() {

        // Given the service throws an unexpected exception
        when(adminEmployeeOverviewService.getEmployeeOverview(5L))
                .thenThrow(new RuntimeException("unexpected error"));

        // When the controller employee overview endpoint is called
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminEmployeeOverviewController.getEmployeeOverview(5L)
        );

        // Then the controller should return HTTP 500
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }
}