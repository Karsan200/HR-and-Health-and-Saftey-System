package uk.co.garagebridgend.backend.logic;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.ActiveProfiles;

import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInEventTable;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.request.ClockInCreateRequest;
import uk.co.garagebridgend.backend.models.request.ClockInOverrideRequest;
import uk.co.garagebridgend.backend.models.response.AccountSearchResponse;
import uk.co.garagebridgend.backend.models.response.ClockInAdminResponse;
import uk.co.garagebridgend.backend.models.response.TodaysClockInsResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInEventRepository;
import uk.co.garagebridgend.backend.repository.ClockInReportRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for {@link ClockInAdminService}.
 */
@ActiveProfiles("test")
public class ClockInAdminServiceTest {

    @Mock
    private ClockInRepository clockInRepository;

    @Mock
    private ClockInReportRepository clockInReportRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private ClockInEventRepository clockInEventRepository;

    @InjectMocks
    private ClockInAdminService clockInAdminService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    // Helpers

    private AccountTable buildAccount(final Long id, final String firstName, final String lastName) {
        AccountTable account = new AccountTable();
        account.setAccountId(id);
        account.setFirstName(firstName);
        account.setLastName(lastName);
        return account;
    }

    private ClockInTable buildRecord(final AccountTable account, final LocalDate date,
                                     final LocalTime clockIn, final LocalTime clockOut) {
        ClockInTable record = new ClockInTable();
        record.setClockInId(UUID.randomUUID());
        record.setAccount(account);
        record.setClockInTime(clockIn);
        record.setClockOutTime(clockOut);
        record.setCreated(date.atTime(clockIn != null ? clockIn : LocalTime.MIDNIGHT));
        return record;
    }

    private ClockInReportTable buildReport(final ClockInTable record) {
        ClockInReportTable report = new ClockInReportTable();
        report.setReportId(1L);
        report.setClockIn(record);
        report.setIssue("I arrived on time but was clocked in late.");
        report.setCreated(LocalDateTime.now());
        return report;
    }

    private ClockInEventTable buildEvent(final AccountTable account, final LocalDateTime timestamp) {
        ClockInEventTable event = new ClockInEventTable();
        event.setClockInEventId(UUID.randomUUID());
        event.setAccount(account);
        event.setCreated(timestamp);
        return event;
    }

    // getClockInsForDate

    @Test
    void testGetClockInsForDateReturnsRecords() {

        // Given two clock-in records exist for the given date
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        ClockInTable record1 = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));
        ClockInTable record2 = buildRecord(account, date, LocalTime.of(8, 5), LocalTime.of(17, 0));

        when(clockInRepository.findAllForDate(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(record1, record2));
        when(clockInReportRepository.findMostRecentByClockIn(any())).thenReturn(Optional.empty());

        // When clock-ins are fetched for that date
        List<ClockInAdminResponse> result = clockInAdminService.getClockInsForDate(date);

        // Then two records should be returned
        assertEquals(2, result.size());
    }

    @Test
    void testGetClockInsForDateReturnsEmptyListWhenNoRecords() {

        // Given no records exist for the given date
        LocalDate date = LocalDate.of(2026, 4, 7);

        when(clockInRepository.findAllForDate(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());

        // When clock-ins are fetched for that date
        List<ClockInAdminResponse> result = clockInAdminService.getClockInsForDate(date);

        // Then the result should be empty
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetClockInsForDateMapsEmployeeNameCorrectly() {

        // Given a record exists for an employee named "Jane Doe"
        AccountTable account = buildAccount(1L, "Jane", "Doe");
        LocalDate date = LocalDate.of(2026, 4, 7);
        ClockInTable record = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));

        when(clockInRepository.findAllForDate(any(), any())).thenReturn(List.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(any())).thenReturn(Optional.empty());

        // When clock-ins are fetched for that date
        List<ClockInAdminResponse> result = clockInAdminService.getClockInsForDate(date);

        // Then the employee name should be "Jane Doe"
        assertEquals("Jane Doe", result.getFirst().employeeName());
    }

    @Test
    void testGetClockInsForDateAttachesReport() {

        // Given a record exists with an associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        ClockInTable record = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));
        ClockInReportTable report = buildReport(record);

        when(clockInRepository.findAllForDate(any(), any())).thenReturn(List.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.of(report));

        // When clock-ins are fetched for that date
        List<ClockInAdminResponse> result = clockInAdminService.getClockInsForDate(date);

        // Then the response should contain the report summary
        assertNotNull(result.getFirst().report());
        assertEquals(report.getReportId(), result.getFirst().report().reportId());
        assertEquals(report.getIssue(), result.getFirst().report().issue());
    }

    @Test
    void testGetClockInsForDateReportIsNullWhenNoneExists() {

        // Given a record exists with no associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        ClockInTable record = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));

        when(clockInRepository.findAllForDate(any(), any())).thenReturn(List.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.empty());

        // When clock-ins are fetched for that date
        List<ClockInAdminResponse> result = clockInAdminService.getClockInsForDate(date);

        // Then the report field should be null
        assertNull(result.getFirst().report());
    }

    // overrideClockIn

    @Test
    void testOverrideClockInUpdatesTimesSuccessfully() {

        // Given a clock-in record exists
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);

        ClockInOverrideRequest override = new ClockInOverrideRequest(
                LocalTime.of(9, 0), LocalTime.of(18, 0), false
        );

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));

        // When the override is applied
        clockInAdminService.overrideClockIn(clockId, override);

        // Then the record should be saved with updated times
        verify(clockInRepository).save(record);
        assertEquals(LocalTime.of(9, 0), record.getClockInTime());
        assertEquals(LocalTime.of(18, 0), record.getClockOutTime());
    }

    @Test
    void testOverrideClockInClearsTimesWhenNull() {

        // Given a clock-in record exists and the override sets both times to null
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);

        ClockInOverrideRequest override = new ClockInOverrideRequest(null, null, false);

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));

        // When the override is applied with null times
        clockInAdminService.overrideClockIn(clockId, override);

        // Then both times should be null on the saved record
        verify(clockInRepository).save(record);
        assertNull(record.getClockInTime());
        assertNull(record.getClockOutTime());
    }

    @Test
    void testOverrideClockInThrowsWhenRecordNotFound() {

        // Given no record exists for the given clock ID
        UUID clockId = UUID.randomUUID();
        ClockInOverrideRequest override = new ClockInOverrideRequest(
                LocalTime.of(9, 0), LocalTime.of(17, 0), false
        );

        when(clockInRepository.findById(clockId)).thenReturn(Optional.empty());

        // When the override is attempted
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInAdminService.overrideClockIn(clockId, override)
        );

        // Then an exception should be thrown and nothing saved
        assertEquals("Clock-in record not found.", exception.getMessage());
        verify(clockInRepository, never()).save(any());
    }

    @Test
    void testOverrideClockInRemovesReportWhenRequested() {

        // Given a clock-in record exists with an associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);
        ClockInReportTable report = buildReport(record);

        ClockInOverrideRequest override = new ClockInOverrideRequest(
                LocalTime.of(8, 0), LocalTime.of(17, 0), true
        );

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.of(report));

        // When the override is applied with removeReport=true
        clockInAdminService.overrideClockIn(clockId, override);

        // Then the report should be deleted
        verify(clockInReportRepository).delete(report);
    }

    @Test
    void testOverrideClockInDoesNotDeleteReportWhenRemoveReportFalse() {

        // Given a clock-in record exists with an associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);

        ClockInOverrideRequest override = new ClockInOverrideRequest(
                LocalTime.of(8, 0), LocalTime.of(17, 0), false
        );

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));

        // When the override is applied with removeReport=false
        clockInAdminService.overrideClockIn(clockId, override);

        // Then no report deletion should occur
        verify(clockInReportRepository, never()).delete(any());
    }

    @Test
    void testOverrideClockInRemoveReportNoopWhenNoReportExists() {

        // Given a clock-in record exists with no associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);

        ClockInOverrideRequest override = new ClockInOverrideRequest(
                LocalTime.of(8, 0), LocalTime.of(17, 0), true
        );

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.empty());

        // When the override is applied with removeReport=true but no report exists
        // Then no exception should be thrown and no deletion should occur
        assertDoesNotThrow(() -> clockInAdminService.overrideClockIn(clockId, override));
        verify(clockInReportRepository, never()).delete(any());
    }

    @Test
    void testOverrideClockInSetsAdminAdjustedFlag() {

        // Given a clock-in record exists that has not been admin-adjusted
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);
        record.setAdminAdjusted(false);

        ClockInOverrideRequest override = new ClockInOverrideRequest(
                LocalTime.of(9, 0), LocalTime.of(17, 0), false
        );

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));

        // When the override is applied
        clockInAdminService.overrideClockIn(clockId, override);

        // Then the admin-adjusted flag should be set to true
        assertTrue(record.isAdminAdjusted());
    }

    // getAllClockIns

    @Test
    void testGetAllClockInsReturnsAllRecords() {

        // Given three clock-in records exist across different dates and employees
        AccountTable account1 = buildAccount(1L, "Alice", "Jones");
        AccountTable account2 = buildAccount(2L, "Bob", "Brown");
        LocalDate date1 = LocalDate.of(2026, 1, 5);
        LocalDate date2 = LocalDate.of(2026, 1, 6);

        List<ClockInTable> records = List.of(
                buildRecord(account1, date1, LocalTime.of(8, 0), LocalTime.of(17, 0)),
                buildRecord(account2, date1, LocalTime.of(8, 5), LocalTime.of(17, 0)),
                buildRecord(account1, date2, LocalTime.of(8, 0), LocalTime.of(17, 0))
        );

        when(clockInRepository.findAll()).thenReturn(records);
        when(clockInReportRepository.findMostRecentByClockIn(any())).thenReturn(Optional.empty());

        // When all clock-ins are fetched
        List<ClockInAdminResponse> result = clockInAdminService.getAllClockIns();

        // Then all three records should be returned
        assertEquals(3, result.size());
    }

    @Test
    void testGetAllClockInsReturnsEmptyListWhenNoRecords() {

        // Given no records exist
        when(clockInRepository.findAll()).thenReturn(List.of());

        // When all clock-ins are fetched
        List<ClockInAdminResponse> result = clockInAdminService.getAllClockIns();

        // Then the result should be empty
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetAllClockInsOrderedByCreatedAscending() {

        // Given two records with different created timestamps
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate earlier = LocalDate.of(2026, 1, 5);
        LocalDate later = LocalDate.of(2026, 1, 6);

        ClockInTable record1 = buildRecord(account, later, LocalTime.of(8, 0), LocalTime.of(17, 0));
        ClockInTable record2 = buildRecord(account, earlier, LocalTime.of(8, 0), LocalTime.of(17, 0));

        when(clockInRepository.findAll()).thenReturn(List.of(record1, record2));
        when(clockInReportRepository.findMostRecentByClockIn(any())).thenReturn(Optional.empty());

        // When all clock-ins are fetched
        List<ClockInAdminResponse> result = clockInAdminService.getAllClockIns();

        // Then records should be sorted with the earliest created time first
        assertTrue(result.get(0).created().isBefore(result.get(1).created()));
    }

    // createClockIn

    @Test
    void testCreateClockInSuccessfully() {

        // Given a valid account exists and no clock-in exists for that date
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        UUID savedId = UUID.randomUUID();

        ClockInCreateRequest request = new ClockInCreateRequest(
                1L, date, LocalTime.of(8, 0), LocalTime.of(17, 0)
        );

        ClockInTable savedRecord = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));
        savedRecord.setClockInId(savedId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(clockInRepository.existsByAccountAndDate(eq(1L), any(), any())).thenReturn(false);
        when(clockInRepository.saveAndFlush(any(ClockInTable.class))).thenReturn(savedRecord);

        // When a new clock-in is created
        assertDoesNotThrow(() -> clockInAdminService.createClockIn(request));

        // Then the record should be saved and backdated
        verify(clockInRepository).saveAndFlush(any(ClockInTable.class));
        verify(clockInRepository).backdateCreated(eq(savedId), any(LocalDateTime.class));
    }

    @Test
    void testCreateClockInThrowsWhenAccountNotFound() {

        // Given the account ID does not exist
        LocalDate date = LocalDate.of(2026, 4, 7);
        ClockInCreateRequest request = new ClockInCreateRequest(
                99L, date, LocalTime.of(8, 0), LocalTime.of(17, 0)
        );

        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        // When a clock-in creation is attempted
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInAdminService.createClockIn(request)
        );

        // Then the service should reject the request
        assertEquals("Account not found.", exception.getMessage());
        verify(clockInRepository, never()).saveAndFlush(any());
    }

    @Test
    void testCreateClockInThrowsWhenRecordAlreadyExists() {

        // Given a clock-in record already exists for that employee and date
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);

        ClockInCreateRequest request = new ClockInCreateRequest(
                1L, date, LocalTime.of(8, 0), LocalTime.of(17, 0)
        );

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(clockInRepository.existsByAccountAndDate(eq(1L), any(), any())).thenReturn(true);

        // When a clock-in creation is attempted for a date that already has a record
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInAdminService.createClockIn(request)
        );

        // Then the service should reject the duplicate
        assertTrue(exception.getMessage().contains("A clock-in record already exists"));
        verify(clockInRepository, never()).saveAndFlush(any());
    }

    @Test
    void testCreateClockInWithNullClockOutTime() {

        // Given a valid account and a request with no clock-out time
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        UUID savedId = UUID.randomUUID();

        ClockInCreateRequest request = new ClockInCreateRequest(1L, date, LocalTime.of(8, 0), null);

        ClockInTable savedRecord = buildRecord(account, date, LocalTime.of(8, 0), null);
        savedRecord.setClockInId(savedId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(clockInRepository.existsByAccountAndDate(eq(1L), any(), any())).thenReturn(false);
        when(clockInRepository.saveAndFlush(any())).thenReturn(savedRecord);

        // When the clock-in is created with a null clock-out time
        // Then it should succeed without error
        assertDoesNotThrow(() -> clockInAdminService.createClockIn(request));
        verify(clockInRepository).saveAndFlush(any());
    }

    @Test
    void testCreateClockInSetsAdminAdjustedFlag() {

        // Given a valid account exists and no clock-in exists for that date
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        UUID savedId = UUID.randomUUID();

        ClockInCreateRequest request = new ClockInCreateRequest(
                1L, date, LocalTime.of(8, 0), LocalTime.of(17, 0)
        );

        ClockInTable savedRecord = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));
        savedRecord.setClockInId(savedId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(clockInRepository.existsByAccountAndDate(eq(1L), any(), any())).thenReturn(false);
        when(clockInRepository.saveAndFlush(any(ClockInTable.class))).thenAnswer(invocation -> {
            ClockInTable r = invocation.getArgument(0);
            r.setClockInId(savedId);
            return r;
        });

        // When the clock-in is created manually by an admin
        ClockInTable result = clockInAdminService.createClockIn(request);

        // Then the admin-adjusted flag should be set to true on the persisted record
        assertTrue(result.isAdminAdjusted());
    }

    @Test
    void testCreateClockInBackdatesCreatedToStartOfRequestedDate() {

        // Given a valid account exists and no clock-in exists for that date
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 7);
        UUID savedId = UUID.randomUUID();

        ClockInCreateRequest request = new ClockInCreateRequest(
                1L, date, LocalTime.of(8, 0), LocalTime.of(17, 0)
        );

        ClockInTable savedRecord = buildRecord(account, date, LocalTime.of(8, 0), LocalTime.of(17, 0));
        savedRecord.setClockInId(savedId);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(clockInRepository.existsByAccountAndDate(eq(1L), any(), any())).thenReturn(false);
        when(clockInRepository.saveAndFlush(any(ClockInTable.class))).thenReturn(savedRecord);

        // When the clock-in is created
        clockInAdminService.createClockIn(request);

        // Then backdateCreated should be called with the start of the requested date
        verify(clockInRepository).backdateCreated(eq(savedId), eq(date.atStartOfDay()));
    }

    // deleteClockIn

    @Test
    void testDeleteClockInSuccessfully() {

        // Given a clock-in record exists with no associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.empty());

        // When the record is deleted
        clockInAdminService.deleteClockIn(clockId);

        // Then the record should be deleted from the repository
        verify(clockInRepository).delete(record);
    }

    @Test
    void testDeleteClockInAlsoDeletesReport() {

        // Given a clock-in record exists with an associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);
        ClockInReportTable report = buildReport(record);

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.of(report));

        // When the record is deleted
        clockInAdminService.deleteClockIn(clockId);

        // Then both the report and the record should be deleted
        verify(clockInReportRepository).delete(report);
        verify(clockInRepository).delete(record);
    }

    @Test
    void testDeleteClockInThrowsWhenRecordNotFound() {

        // Given no record exists for the given clock ID
        UUID clockId = UUID.randomUUID();

        when(clockInRepository.findById(clockId)).thenReturn(Optional.empty());

        // When deletion is attempted
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInAdminService.deleteClockIn(clockId)
        );

        // Then an exception should be thrown and nothing deleted
        assertEquals("Clock-in record not found.", exception.getMessage());
        verify(clockInRepository, never()).delete(any());
    }

    @Test
    void testDeleteClockInDeletesReportBeforeRecord() {

        // Given a clock-in record exists with an associated report
        AccountTable account = buildAccount(1L, "John", "Smith");
        UUID clockId = UUID.randomUUID();
        ClockInTable record = buildRecord(account, LocalDate.now(), LocalTime.of(8, 0), LocalTime.of(17, 0));
        record.setClockInId(clockId);
        ClockInReportTable report = buildReport(record);

        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(record));
        when(clockInReportRepository.findMostRecentByClockIn(record)).thenReturn(Optional.of(report));

        // Capture the order in which deletions happen
        var order = inOrder(clockInReportRepository, clockInRepository);

        // When the record is deleted
        clockInAdminService.deleteClockIn(clockId);

        // Then the report must be deleted before the clock-in record to avoid
        // a foreign key constraint violation
        order.verify(clockInReportRepository).delete(report);
        order.verify(clockInRepository).delete(record);
    }

    // searchAccounts

    @Test
    void testSearchAccountsReturnsMatchingResults() {

        // Given an account exists matching the query "John"
        AccountTable account = buildAccount(1L, "John", "Smith");

        when(accountRepository.searchByName("John")).thenReturn(List.of(account));

        // When accounts are searched with query "John"
        List<AccountSearchResponse> result = clockInAdminService.searchAccounts("John");

        // Then one result should be returned with the correct name
        assertEquals(1, result.size());
        assertEquals("John Smith", result.getFirst().fullName());
        assertEquals(1L, result.getFirst().accountId());
    }

    @Test
    void testSearchAccountsReturnsEmptyForBlankQuery() {

        // Given a blank query string
        // When accounts are searched with an empty string
        List<AccountSearchResponse> result = clockInAdminService.searchAccounts("   ");

        // Then an empty list should be returned without calling the repository
        assertTrue(result.isEmpty());
        verify(accountRepository, never()).searchByName(any());
    }

    @Test
    void testSearchAccountsReturnsEmptyForNullQuery() {

        // Given a null query string
        // When accounts are searched with null
        List<AccountSearchResponse> result = clockInAdminService.searchAccounts(null);

        // Then an empty list should be returned without calling the repository
        assertTrue(result.isEmpty());
        verify(accountRepository, never()).searchByName(any());
    }

    @Test
    void testSearchAccountsTrimsQueryBeforeSearching() {

        // Given a query string with leading and trailing whitespace
        AccountTable account = buildAccount(1L, "Alice", "Jones");

        when(accountRepository.searchByName("Alice")).thenReturn(List.of(account));

        // When accounts are searched with padded whitespace
        List<AccountSearchResponse> result = clockInAdminService.searchAccounts("  Alice  ");

        // Then the repository should be called with the trimmed query
        verify(accountRepository).searchByName("Alice");
        assertEquals(1, result.size());
    }

    @Test
    void testSearchAccountsReturnsEmptyListWhenNoMatches() {

        // Given no accounts match the query
        when(accountRepository.searchByName("XYZ")).thenReturn(List.of());

        // When accounts are searched
        List<AccountSearchResponse> result = clockInAdminService.searchAccounts("XYZ");

        // Then an empty list should be returned
        assertTrue(result.isEmpty());
    }

    @Test
    void testSearchAccountsMapsMultipleResultsCorrectly() {

        // Given two accounts match the query "son"
        AccountTable account1 = buildAccount(1L, "Jason", "Miller");
        AccountTable account2 = buildAccount(2L, "Allison", "Brown");

        when(accountRepository.searchByName("son")).thenReturn(List.of(account1, account2));

        // When accounts are searched
        List<AccountSearchResponse> result = clockInAdminService.searchAccounts("son");

        // Then both results should be returned with correct full names
        assertEquals(2, result.size());
        assertEquals("Jason Miller", result.get(0).fullName());
        assertEquals("Allison Brown", result.get(1).fullName());
    }

    // getTodaysClockIns

    @Test
    void testGetTodaysClockInsReturnsEmptyListWhenNoEvents() {

        // Given no clock-in events exist for today
        LocalDate date = LocalDate.of(2026, 4, 22);

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of());

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then the result should be empty
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetTodaysClockInsReturnsSingleEmployeeWithOneEvent() {

        // Given one clock-in event exists for a single employee today
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        ClockInEventTable event = buildEvent(account, date.atTime(8, 0));

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of(event));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then one entry should be returned for that employee
        assertEquals(1, result.size());
        assertEquals(1L, result.getFirst().accountId());
        assertEquals("John Smith", result.getFirst().employeeName());
    }

    @Test
    void testGetTodaysClockInsPopulatesFirstOnSite() {

        // Given one clock-in event exists for an employee
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        LocalDateTime arrivalTime = date.atTime(8, 0);
        ClockInEventTable event = buildEvent(account, arrivalTime);

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of(event));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then firstOnSite should be populated with the event's timestamp
        assertNotNull(result.getFirst().firstOnSite());
        assertEquals(arrivalTime, result.getFirst().firstOnSite().timestamp());
    }

    @Test
    void testGetTodaysClockInsLastOnSiteIsNullForSingleEvent() {

        // Given only one clock-in event exists for an employee today
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        ClockInEventTable event = buildEvent(account, date.atTime(8, 0));

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of(event));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then lastOnSite should be null since there is only one event
        assertNull(result.getFirst().lastOnSite());
    }

    @Test
    void testGetTodaysClockInsPopulatesLastOnSiteForMultipleEvents() {

        // Given an employee has two clock-in events today
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        LocalDateTime firstTime = date.atTime(8, 0);
        LocalDateTime lastTime  = date.atTime(14, 30);
        ClockInEventTable event1 = buildEvent(account, firstTime);
        ClockInEventTable event2 = buildEvent(account, lastTime);

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(event1, event2));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then lastOnSite should be populated with the latest event's timestamp
        assertNotNull(result.getFirst().lastOnSite());
        assertEquals(lastTime, result.getFirst().lastOnSite().timestamp());
    }

    @Test
    void testGetTodaysClockInsFirstOnSiteIsEarliestEvent() {

        // Given an employee has three events today with different timestamps
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        LocalDateTime earliest = date.atTime(7, 45);
        LocalDateTime middle   = date.atTime(12, 0);
        LocalDateTime latest   = date.atTime(16, 0);

        ClockInEventTable event1 = buildEvent(account, earliest);
        ClockInEventTable event2 = buildEvent(account, middle);
        ClockInEventTable event3 = buildEvent(account, latest);

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(event1, event2, event3));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then firstOnSite should reflect the earliest timestamp
        assertEquals(earliest, result.getFirst().firstOnSite().timestamp());
    }

    @Test
    void testGetTodaysClockInsLastOnSiteIsLatestEvent() {

        // Given an employee has three events today
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        LocalDateTime earliest = date.atTime(7, 45);
        LocalDateTime middle   = date.atTime(12, 0);
        LocalDateTime latest   = date.atTime(16, 0);

        ClockInEventTable event1 = buildEvent(account, earliest);
        ClockInEventTable event2 = buildEvent(account, middle);
        ClockInEventTable event3 = buildEvent(account, latest);

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(event1, event2, event3));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then lastOnSite should reflect the latest timestamp
        assertEquals(latest, result.getFirst().lastOnSite().timestamp());
    }

    @Test
    void testGetTodaysClockInsAllEventsContainsEveryEvent() {

        // Given an employee has three clock-in events today
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        ClockInEventTable event1 = buildEvent(account, date.atTime(7, 45));
        ClockInEventTable event2 = buildEvent(account, date.atTime(12, 0));
        ClockInEventTable event3 = buildEvent(account, date.atTime(16, 0));

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(event1, event2, event3));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then allEvents should contain all three events
        assertEquals(3, result.getFirst().allEvents().size());
    }

    @Test
    void testGetTodaysClockInsAllEventsOrderedAscending() {

        // Given an employee has three events returned in ascending order from the repository
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        LocalDateTime first  = date.atTime(7, 45);
        LocalDateTime second = date.atTime(12, 0);
        LocalDateTime third  = date.atTime(16, 0);

        ClockInEventTable event1 = buildEvent(account, first);
        ClockInEventTable event2 = buildEvent(account, second);
        ClockInEventTable event3 = buildEvent(account, third);

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(event1, event2, event3));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then allEvents should preserve ascending order
        List<TodaysClockInsResponse.ClockInEventSummary> events = result.getFirst().allEvents();
        assertEquals(first,  events.get(0).timestamp());
        assertEquals(second, events.get(1).timestamp());
        assertEquals(third,  events.get(2).timestamp());
    }

    @Test
    void testGetTodaysClockInsGroupsEventsByEmployee() {

        // Given two employees each have one clock-in event today
        AccountTable account1 = buildAccount(1L, "John", "Smith");
        AccountTable account2 = buildAccount(2L, "Alice", "Jones");
        LocalDate date = LocalDate.of(2026, 4, 22);

        ClockInEventTable event1 = buildEvent(account1, date.atTime(8, 0));
        ClockInEventTable event2 = buildEvent(account2, date.atTime(9, 0));

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(event1, event2));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then two separate entries should be returned, one per employee
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).accountId());
        assertEquals(2L, result.get(1).accountId());
    }

    @Test
    void testGetTodaysClockInsGroupsMultipleEventsUnderSameEmployee() {

        // Given one employee has three events and another employee has one event
        AccountTable account1 = buildAccount(1L, "John", "Smith");
        AccountTable account2 = buildAccount(2L, "Alice", "Jones");
        LocalDate date = LocalDate.of(2026, 4, 22);

        ClockInEventTable e1 = buildEvent(account1, date.atTime(8, 0));
        ClockInEventTable e2 = buildEvent(account1, date.atTime(12, 0));
        ClockInEventTable e3 = buildEvent(account1, date.atTime(16, 0));
        ClockInEventTable e4 = buildEvent(account2, date.atTime(9, 0));

        when(clockInEventRepository.findAllForDateRange(any(), any()))
                .thenReturn(List.of(e1, e2, e3, e4));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then John should have 3 events and Alice should have 1
        TodaysClockInsResponse john  = result.stream()
                .filter(r -> r.accountId().equals(1L)).findFirst().orElseThrow();
        TodaysClockInsResponse alice = result.stream()
                .filter(r -> r.accountId().equals(2L)).findFirst().orElseThrow();

        assertEquals(3, john.allEvents().size());
        assertEquals(1, alice.allEvents().size());
    }

    @Test
    void testGetTodaysClockInsMapsEmployeeNameCorrectly() {

        // Given an employee named "Jane Doe" has a clock-in event today
        AccountTable account = buildAccount(1L, "Jane", "Doe");
        LocalDate date = LocalDate.of(2026, 4, 22);
        ClockInEventTable event = buildEvent(account, date.atTime(8, 0));

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of(event));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then the employee name should be "Jane Doe"
        assertEquals("Jane Doe", result.getFirst().employeeName());
    }

    @Test
    void testGetTodaysClockInsQueriesCorrectDateRange() {

        // Given a specific date to query
        LocalDate date = LocalDate.of(2026, 4, 22);
        LocalDateTime expectedStart = date.atStartOfDay();
        LocalDateTime expectedEnd   = date.atTime(LocalTime.MAX);

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of());

        // When today's clock-ins are fetched for that date
        clockInAdminService.getTodaysClockIns(date);

        // Then the repository should be queried with the correct start and end of day
        verify(clockInEventRepository).findAllForDateRange(expectedStart, expectedEnd);
    }

    @Test
    void testGetTodaysClockInsEventSummaryContainsCorrectEventId() {

        // Given an event with a known UUID
        AccountTable account = buildAccount(1L, "John", "Smith");
        LocalDate date = LocalDate.of(2026, 4, 22);
        UUID knownEventId = UUID.randomUUID();

        ClockInEventTable event = buildEvent(account, date.atTime(8, 0));
        event.setClockInEventId(knownEventId);

        when(clockInEventRepository.findAllForDateRange(any(), any())).thenReturn(List.of(event));

        // When today's clock-ins are fetched
        List<TodaysClockInsResponse> result = clockInAdminService.getTodaysClockIns(date);

        // Then the event summary should carry the correct UUID
        assertEquals(knownEventId, result.getFirst().firstOnSite().eventId());
    }
}