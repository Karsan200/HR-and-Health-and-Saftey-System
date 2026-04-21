package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.ClockInAdminService;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.response.AccountSearchResponse;
import uk.co.garagebridgend.backend.models.response.ClockInAdminResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests for {@link ClockInAdminController}.
 */
@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
public class ClockInAdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClockInAdminService clockInAdminService;

    @InjectMocks
    private ClockInAdminController clockInAdminController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(clockInAdminController).build();
    }

    // Helpers

    private ClockInAdminResponse buildAdminResponse() {
        return new ClockInAdminResponse(
                UUID.randomUUID(),
                "John Smith",
                1L,
                LocalTime.of(8, 0),
                LocalTime.of(17, 0),
                LocalDateTime.now(),
                false,
                null
        );
    }

    /**
     * Builds a minimal {@link ClockInTable} stub with a generated ID.
     * Used to satisfy the non-void return type of {@code createClockIn}.
     */
    private ClockInTable buildClockInTableStub() {
        ClockInTable stub = new ClockInTable();
        stub.setClockInId(UUID.randomUUID());
        return stub;
    }

    // GET /api/admin/clock-ins

    @Test
    void testGetClockInsForDateSuccess() throws Exception {

        // Given the service returns a list of records for the given date
        when(clockInAdminService.getClockInsForDate(any(LocalDate.class)))
                .thenReturn(List.of(buildAdminResponse()));

        // When the client requests clock-ins for a specific date
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(get("/api/admin/clock-ins")
                        .param("date", "2026-04-07"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetClockInsForDateReturnsEmptyList() throws Exception {

        // Given the service returns no records for the given date
        when(clockInAdminService.getClockInsForDate(any(LocalDate.class)))
                .thenReturn(List.of());

        // When the client requests clock-ins for a date with no records
        // Then the controller should still return HTTP 200 (OK) with an empty list
        mockMvc.perform(get("/api/admin/clock-ins")
                        .param("date", "2026-04-07"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetClockInsForDateThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        when(clockInAdminService.getClockInsForDate(any(LocalDate.class)))
                .thenThrow(new RuntimeException("Database error"));

        // When the client requests clock-ins for a date
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(get("/api/admin/clock-ins")
                        .param("date", "2026-04-07"))
                .andExpect(status().isInternalServerError());
    }

    // GET /api/admin/clock-ins/all

    @Test
    void testGetAllClockInsSuccess() throws Exception {

        // Given the service returns a list of all records
        when(clockInAdminService.getAllClockIns())
                .thenReturn(List.of(buildAdminResponse(), buildAdminResponse()));

        // When the client requests all clock-ins
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(get("/api/admin/clock-ins/all"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetAllClockInsReturnsEmptyList() throws Exception {

        // Given the service returns no records
        when(clockInAdminService.getAllClockIns()).thenReturn(List.of());

        // When the client requests all clock-ins
        // Then the controller should return HTTP 200 (OK) with an empty list
        mockMvc.perform(get("/api/admin/clock-ins/all"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetAllClockInsThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        when(clockInAdminService.getAllClockIns())
                .thenThrow(new RuntimeException("Database error"));

        // When the client requests all clock-ins
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(get("/api/admin/clock-ins/all"))
                .andExpect(status().isInternalServerError());
    }

    // POST /api/admin/clock-ins/{clockId}/override

    @Test
    void testOverrideClockInSuccess() throws Exception {

        // Given the service successfully applies the override
        doNothing().when(clockInAdminService).overrideClockIn(any(UUID.class), any());

        // When the client submits a valid override request
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(post("/api/admin/clock-ins/{clockId}/override", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00",
                            "removeReport": false
                        }
                        """))
                .andExpect(status().isOk());
    }

    @Test
    void testOverrideClockInRecordNotFound() throws Exception {

        // Given the service rejects the request because no record exists for the given ID
        doThrow(new IllegalArgumentException("Clock-in record not found."))
                .when(clockInAdminService).overrideClockIn(any(UUID.class), any());

        // When the client submits an override for a non-existent record
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/admin/clock-ins/{clockId}/override", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00",
                            "removeReport": false
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testOverrideClockInThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        doThrow(new RuntimeException("Database error"))
                .when(clockInAdminService).overrideClockIn(any(UUID.class), any());

        // When the client submits an override request
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(post("/api/admin/clock-ins/{clockId}/override", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00",
                            "removeReport": false
                        }
                        """))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testOverrideClockInWithRemoveReportTrue() throws Exception {

        // Given the service successfully applies the override and removes the report
        doNothing().when(clockInAdminService).overrideClockIn(any(UUID.class), any());

        // When the client submits an override with removeReport=true
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(post("/api/admin/clock-ins/{clockId}/override", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00",
                            "removeReport": true
                        }
                        """))
                .andExpect(status().isOk());
    }

    @Test
    void testOverrideClockInWithNullTimes() throws Exception {

        // Given the service successfully clears both times on the record
        doNothing().when(clockInAdminService).overrideClockIn(any(UUID.class), any());

        // When the client submits an override with null clock-in and clock-out times
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(post("/api/admin/clock-ins/{clockId}/override", UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "clockInTime": null,
                            "clockOutTime": null,
                            "removeReport": false
                        }
                        """))
                .andExpect(status().isOk());
    }

    // POST /api/admin/clock-ins

    @Test
    void testCreateClockInSuccess() throws Exception {

        // Given the service successfully creates the record and returns the saved entity
        when(clockInAdminService.createClockIn(any())).thenReturn(buildClockInTableStub());

        // When the client submits a valid create request
        // Then the controller should return HTTP 201 (Created)
        mockMvc.perform(post("/api/admin/clock-ins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "accountId": 1,
                            "date": "2026-04-07",
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00"
                        }
                        """))
                .andExpect(status().isCreated());
    }

    @Test
    void testCreateClockInAccountNotFound() throws Exception {

        // Given the service rejects the request because the account does not exist
        doThrow(new IllegalArgumentException("Account not found."))
                .when(clockInAdminService).createClockIn(any());

        // When the client submits a create request with an invalid account ID
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/admin/clock-ins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "accountId": 999,
                            "date": "2026-04-07",
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateClockInAlreadyExists() throws Exception {

        // Given the service rejects the request because a record already exists for that date
        doThrow(new IllegalArgumentException("A clock-in record already exists for this employee on 2026-04-07."))
                .when(clockInAdminService).createClockIn(any());

        // When the client submits a create request for a date that already has a record
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(post("/api/admin/clock-ins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "accountId": 1,
                            "date": "2026-04-07",
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00"
                        }
                        """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateClockInThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        doThrow(new RuntimeException("Database error"))
                .when(clockInAdminService).createClockIn(any());

        // When the client submits a create request
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(post("/api/admin/clock-ins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "accountId": 1,
                            "date": "2026-04-07",
                            "clockInTime": "08:00",
                            "clockOutTime": "17:00"
                        }
                        """))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testCreateClockInWithNullClockOutTime() throws Exception {

        // Given the service successfully creates the record and returns the saved entity
        when(clockInAdminService.createClockIn(any())).thenReturn(buildClockInTableStub());

        // When the client submits a create request with a null clock-out time
        // Then the controller should return HTTP 201 (Created)
        mockMvc.perform(post("/api/admin/clock-ins")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                            "accountId": 1,
                            "date": "2026-04-07",
                            "clockInTime": "08:00",
                            "clockOutTime": null
                        }
                        """))
                .andExpect(status().isCreated());
    }

    // DELETE /api/admin/clock-ins/{clockId}

    @Test
    void testDeleteClockInSuccess() throws Exception {

        // Given the service successfully deletes the record
        doNothing().when(clockInAdminService).deleteClockIn(any(UUID.class));

        // When the client sends a delete request for an existing record
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(delete("/api/admin/clock-ins/{clockId}", UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteClockInRecordNotFound() throws Exception {

        // Given the service rejects the request because no record exists for the given ID
        doThrow(new IllegalArgumentException("Clock-in record not found."))
                .when(clockInAdminService).deleteClockIn(any(UUID.class));

        // When the client sends a delete request for a non-existent record
        // Then the controller should return HTTP 400 (Bad Request)
        mockMvc.perform(delete("/api/admin/clock-ins/{clockId}", UUID.randomUUID()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteClockInThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        doThrow(new RuntimeException("Database error"))
                .when(clockInAdminService).deleteClockIn(any(UUID.class));

        // When the client sends a delete request
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(delete("/api/admin/clock-ins/{clockId}", UUID.randomUUID()))
                .andExpect(status().isInternalServerError());
    }

    // GET /api/admin/accounts/search

    @Test
    void testSearchAccountsSuccess() throws Exception {

        // Given the service returns matching account results
        List<AccountSearchResponse> results = List.of(
                new AccountSearchResponse(1L, "John Smith"),
                new AccountSearchResponse(2L, "Johnny Walker")
        );

        when(clockInAdminService.searchAccounts("John")).thenReturn(results);

        // When the client searches for accounts with query "John"
        // Then the controller should return HTTP 200 (OK)
        mockMvc.perform(get("/api/admin/accounts/search")
                        .param("query", "John"))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchAccountsReturnsEmptyList() throws Exception {

        // Given the service returns no matching accounts
        when(clockInAdminService.searchAccounts("XYZ")).thenReturn(List.of());

        // When the client searches for accounts with a query that yields no results
        // Then the controller should return HTTP 200 (OK) with an empty list
        mockMvc.perform(get("/api/admin/accounts/search")
                        .param("query", "XYZ"))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchAccountsThrowsException() throws Exception {

        // Given the service throws an unexpected runtime exception
        when(clockInAdminService.searchAccounts(anyString()))
                .thenThrow(new RuntimeException("Database error"));

        // When the client submits a search request
        // Then the controller should return HTTP 500 (Internal Server Error)
        mockMvc.perform(get("/api/admin/accounts/search")
                        .param("query", "John"))
                .andExpect(status().isInternalServerError());
    }
}