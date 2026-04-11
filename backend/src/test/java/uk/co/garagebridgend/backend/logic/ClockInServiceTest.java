package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.ClockInRecordResponse;
import uk.co.garagebridgend.backend.models.response.ClockInStatusResponse;
import uk.co.garagebridgend.backend.repository.ClockInReportRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests for {@link ClockInService}.
 */
@ActiveProfiles("test")
@Transactional
public class ClockInServiceTest {

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private ClockInRepository clockInRepository;

    @Mock
    private ClockInReportRepository clockInReportRepository;

    @InjectMocks
    private ClockInService clockInService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(clockInService, "mondayToThursdayStartTime", LocalTime.of(8, 0));
        ReflectionTestUtils.setField(clockInService, "mondayToThursdayEndTime", LocalTime.of(17, 0));
        ReflectionTestUtils.setField(clockInService, "fridayStartTime", LocalTime.of(8, 0));
        ReflectionTestUtils.setField(clockInService, "fridayEndTime", LocalTime.of(12, 0));
    }

    // Helpers

    private AccountTable buildAccount(final Long id) {
        AccountTable account = new AccountTable();
        account.setAccountId(id);
        return account;
    }

    private ClockInTable buildRecord(
            final AccountTable account,
            final LocalDate date,
            final LocalTime clockIn,
            final LocalTime clockOut) {
        ClockInTable record = new ClockInTable();
        record.setClockInId(UUID.randomUUID());
        record.setAccount(account);
        record.setClockInTime(clockIn);
        record.setClockOutTime(clockOut);
        record.setCreated(date.atTime(clockIn));
        return record;
    }

    // getStatus

    @Test
    void testGetStatusYesterdayTimesPopulated() {

        // Given one clock-in record exists for yesterday
        AccountTable account = buildAccount(1L);
        LocalDate yesterday = LocalDate.now().minusDays(1);
        ClockInTable record = buildRecord(account, yesterday, LocalTime.of(8, 0), LocalTime.of(17, 0));

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(List.of(record));

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then yesterday's clock-in and clock-out times should be populated
        assertEquals("08:00", response.getYesterdayClockIn());
        assertEquals("17:00", response.getYesterdayClockOut());
    }

    @Test
    void testGetStatusYesterdayNoRecord() {

        // Given no clock-in record exists for yesterday
        AccountTable account = buildAccount(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(List.of());

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then yesterday's times should both be null
        assertNull(response.getYesterdayClockIn());
        assertNull(response.getYesterdayClockOut());
    }

    @Test
    void testGetStatusYesterdayNoClockOut() {

        // Given a record exists for yesterday with no clock-out time
        AccountTable account = buildAccount(1L);
        LocalDate yesterday = LocalDate.now().minusDays(1);
        ClockInTable record = buildRecord(account, yesterday, LocalTime.of(8, 0), null);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(List.of(record));

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then clock-in should be populated but clock-out should be null
        assertEquals("08:00", response.getYesterdayClockIn());
        assertNull(response.getYesterdayClockOut());
    }

    @Test
    void testGetStatusDaysWorkedCount() {

        // Given three clock-in records exist for the current year
        AccountTable account = buildAccount(1L);
        LocalDate monday = LocalDate.of(LocalDate.now().getYear(), 1, 5);

        List<ClockInTable> records = List.of(
                buildRecord(account, monday,            LocalTime.of(8, 0), LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(1), LocalTime.of(8, 0), LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(2), LocalTime.of(8, 0), LocalTime.of(17, 0))
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(records);

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then days worked should equal the number of records
        assertEquals(3, response.getDaysWorked());
    }

    @Test
    void testGetStatusLateCountOnlyAfterStartTime() {

        // Given two records: one on time, one late
        AccountTable account = buildAccount(1L);
        LocalDate monday = LocalDate.of(LocalDate.now().getYear(), 1, 5);

        List<ClockInTable> records = List.of(
                buildRecord(account, monday,             LocalTime.of(8, 0),  LocalTime.of(17, 0)), // on time
                buildRecord(account, monday.plusDays(1), LocalTime.of(9, 15), LocalTime.of(17, 0))  // late
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(records);

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then only one late should be counted
        assertEquals(1, response.getTotalLates());
    }

    @Test
    void testGetStatusOnTimePercentAllOnTime() {

        // Given two records both clocked in on time
        AccountTable account = buildAccount(1L);
        LocalDate monday = LocalDate.of(LocalDate.now().getYear(), 1, 5);

        List<ClockInTable> records = List.of(
                buildRecord(account, monday,             LocalTime.of(8, 0), LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(1), LocalTime.of(7, 55), LocalTime.of(17, 0))
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(records);

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then on-time percent should be 100%
        assertEquals(100.0, response.getOnTimePercent());
    }

    @Test
    void testGetStatusOnTimePercentWithLates() {

        // Given four records where one is late
        AccountTable account = buildAccount(1L);
        LocalDate monday = LocalDate.of(LocalDate.now().getYear(), 1, 5);

        List<ClockInTable> records = List.of(
                buildRecord(account, monday,             LocalTime.of(8, 0),  LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(1), LocalTime.of(8, 0),  LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(2), LocalTime.of(8, 0),  LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(3), LocalTime.of(9, 30), LocalTime.of(17, 0)) // late
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(records);

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then on-time percent should be 75%
        assertEquals(75.0, response.getOnTimePercent());
    }

    @Test
    void testGetStatusAvgHoursPerDayStandardDay() {

        // Given two records both with 9 hours worked (08:00–17:00)
        AccountTable account = buildAccount(1L);
        LocalDate monday = LocalDate.of(LocalDate.now().getYear(), 1, 5);

        List<ClockInTable> records = List.of(
                buildRecord(account, monday,             LocalTime.of(8, 0), LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(1), LocalTime.of(8, 0), LocalTime.of(17, 0))
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(records);

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then average hours per day should be 9.0
        assertEquals(9.0, response.getAvgHoursPerDay());
    }

    @Test
    void testGetStatusFridayClockOutCappedAtNoon() {

        // Given a Friday record where the employee stayed until 17:00 (past the 12:00 end)
        AccountTable account = buildAccount(1L);

        // Find the next Friday in the current year
        LocalDate friday = LocalDate.of(LocalDate.now().getYear(), 1, 2);
        while (friday.getDayOfWeek().getValue() != 5) {
            friday = friday.plusDays(1);
        }

        ClockInTable record = buildRecord(account, friday, LocalTime.of(8, 0), LocalTime.of(17, 0));

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(List.of(record));

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then average hours should be capped at 4.0 (08:00–12:00), not 9.0
        assertEquals(4.0, response.getAvgHoursPerDay());
    }

    @Test
    void testGetStatusNoRecordsDefaultsToHundredPercentOnTime() {

        // Given no records exist for the current year
        AccountTable account = buildAccount(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountAndCreatedBetweenOrderByCreatedDesc(
                eq(account), any(), any()))
                .thenReturn(List.of());

        // When status is requested
        ClockInStatusResponse response = clockInService.getStatus();

        // Then on-time percent should default to 100% and stats should be zero
        assertEquals(100.0, response.getOnTimePercent());
        assertEquals(0, response.getDaysWorked());
        assertEquals(0, response.getTotalLates());
        assertEquals(0.0, response.getAvgHoursPerDay());
    }

    @Test
    void testGetStatusUnauthorized() {

        // Given the authentication service cannot find the current user
        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When status is requested
        // Then an AuthenticatedAccountNotFoundException should be thrown
        assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                clockInService.getStatus()
        );
    }

    // getRecentRecords

    @Test
    void testGetRecentRecordsReturnsMappedResponses() {

        // Given three clock-in records exist for the authenticated user
        AccountTable account = buildAccount(1L);
        LocalDate monday = LocalDate.of(LocalDate.now().getYear(), 1, 5);

        List<ClockInTable> records = List.of(
                buildRecord(account, monday,             LocalTime.of(8, 0), LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(1), LocalTime.of(8, 5), LocalTime.of(17, 0)),
                buildRecord(account, monday.plusDays(2), LocalTime.of(8, 0), null)
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountOrderByCreatedDesc(account)).thenReturn(records);

        // When recent records are requested
        List<ClockInRecordResponse> result = clockInService.getRecentRecords();

        // Then all three records should be returned and mapped correctly
        assertEquals(3, result.size());
        assertEquals("08:00", result.get(0).getClockInTime());
        assertEquals("17:00", result.get(0).getClockOutTime());
        assertNull(result.get(2).getClockOutTime());
    }

    @Test
    void testGetRecentRecordsLimitedToTen() {

        // Given eleven clock-in records exist for the authenticated user
        AccountTable account = buildAccount(1L);
        LocalDate date = LocalDate.of(LocalDate.now().getYear(), 1, 6);

        List<ClockInTable> records = new java.util.ArrayList<>();
        for (int i = 0; i < 11; i++) {
            records.add(buildRecord(account, date.plusDays(i), LocalTime.of(8, 0), LocalTime.of(17, 0)));
        }

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountOrderByCreatedDesc(account)).thenReturn(records);

        // When recent records are requested
        List<ClockInRecordResponse> result = clockInService.getRecentRecords();

        // Then only the ten most recent should be returned
        assertEquals(10, result.size());
    }

    @Test
    void testGetRecentRecordsEmpty() {

        // Given no records exist for the authenticated user
        AccountTable account = buildAccount(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findByAccountOrderByCreatedDesc(account)).thenReturn(List.of());

        // When recent records are requested
        List<ClockInRecordResponse> result = clockInService.getRecentRecords();

        // Then an empty list should be returned
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetRecentRecordsUnauthorized() {

        // Given the authentication service cannot find the current user
        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When recent records are requested
        // Then an AuthenticatedAccountNotFoundException should be thrown
        assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                clockInService.getRecentRecords()
        );
    }

    // reportIssue

    @Test
    void testReportIssueSuccess() {

        // Given a valid clock-in record belonging to the authenticated user
        AccountTable account = buildAccount(1L);
        UUID clockId = UUID.randomUUID();
        ClockInTable clockIn = buildRecord(account, LocalDate.now().minusDays(1),
                LocalTime.of(8, 0), LocalTime.of(17, 0));
        clockIn.setClockInId(clockId);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(clockIn));

        // When a report is submitted for that record
        clockInService.reportIssue(clockId, "I arrived on time but was clocked in late.");

        // Then the report should be saved to the repository
        verify(clockInReportRepository).save(any(ClockInReportTable.class));
    }

    @Test
    void testReportIssueBlankIssueThrows() {

        // Given a blank issue description
        UUID clockId = UUID.randomUUID();

        // When reportIssue is called with a blank string
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInService.reportIssue(clockId, "   ")
        );

        // Then the service should reject the request
        assertEquals("Issue description must not be blank.", exception.getMessage());
        verify(clockInReportRepository, never()).save(any());
    }

    @Test
    void testReportIssueNullIssueThrows() {

        // Given a null issue description
        UUID clockId = UUID.randomUUID();

        // When reportIssue is called with null
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInService.reportIssue(clockId, null)
        );

        // Then the service should reject the request
        assertEquals("Issue description must not be blank.", exception.getMessage());
        verify(clockInReportRepository, never()).save(any());
    }

    @Test
    void testReportIssueClockIdNotFound() {

        // Given the clock ID does not exist in the repository
        AccountTable account = buildAccount(1L);
        UUID clockId = UUID.randomUUID();

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(clockInRepository.findById(clockId)).thenReturn(Optional.empty());

        // When a report is submitted for that non-existent record
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInService.reportIssue(clockId, "My clock-in was wrong.")
        );

        // Then the service should reject the request
        assertEquals("Clock-in record not found.", exception.getMessage());
        verify(clockInReportRepository, never()).save(any());
    }

    @Test
    void testReportIssueRecordBelongsToDifferentAccount() {

        // Given a clock-in record that belongs to a different account
        AccountTable requestingAccount = buildAccount(1L);
        AccountTable otherAccount = buildAccount(2L);
        UUID clockId = UUID.randomUUID();

        ClockInTable clockIn = buildRecord(otherAccount, LocalDate.now().minusDays(1),
                LocalTime.of(8, 0), LocalTime.of(17, 0));
        clockIn.setClockInId(clockId);

        when(authenticationService.getCurrentUser()).thenReturn(requestingAccount);
        when(clockInRepository.findById(clockId)).thenReturn(Optional.of(clockIn));

        // When the authenticated user tries to report another user's record
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                clockInService.reportIssue(clockId, "This is not my record.")
        );

        // Then the service should reject the request
        assertEquals("Clock-in record does not belong to this account.", exception.getMessage());
        verify(clockInReportRepository, never()).save(any());
    }

    @Test
    void testReportIssueUnauthorized() {

        // Given the authentication service cannot find the current user
        UUID clockId = UUID.randomUUID();

        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        // When a report is submitted
        // Then an AuthenticatedAccountNotFoundException should be thrown
        assertThrows(AuthenticatedAccountNotFoundException.class, () ->
                clockInService.reportIssue(clockId, "My clock-in was wrong.")
        );

        verify(clockInReportRepository, never()).save(any());
    }
}