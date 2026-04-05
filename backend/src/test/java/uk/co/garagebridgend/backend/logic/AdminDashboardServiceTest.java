package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.entity.SignatureTable;
import uk.co.garagebridgend.backend.models.response.*;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;
import uk.co.garagebridgend.backend.repository.LeaveRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

import java.sql.Time;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class AdminDashboardServiceTest {

    @Mock
    private ClockInRepository clockInRepository;

    @Mock
    private HazardRepository hazardRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private SignatureRepository signatureRepository;

    @Mock
    private LeaveRepository leaveRepository;

    @InjectMocks
    private AdminDashboardService adminDashboardService;

    @Test
    void testGetAdminDashboardSummarySuccess() {

        // Given late arrivals, open hazards, documents requiring signatures and hazards requiring signatures
        DocumentTable documentOne = new DocumentTable();
        documentOne.setDocumentId(1L);

        DocumentTable documentTwo = new DocumentTable();
        documentTwo.setDocumentId(2L);

        HazardTable hazard = new HazardTable();
        hazard.setHazardId(10L);

        when(clockInRepository.countLateClockInsThisWeek(any(), any(), any())).thenReturn(4);
        when(hazardRepository.countOpenHazards()).thenReturn(2);
        when(accountRepository.count()).thenReturn(3L);

        when(documentRepository.findAllBySignatureRequiredTrue())
                .thenReturn(List.of(documentOne, documentTwo));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(2L);
        when(signatureRepository.countByDocumentDocumentId(2L)).thenReturn(1L);

        when(hazardRepository.findAllBySignatureRequiredTrueAndActionCompleteIsNull())
                .thenReturn(List.of(hazard));
        when(signatureRepository.countByHazardHazardId(10L)).thenReturn(1L);

        // When the admin dashboard summary is requested
        AdminDashboardSummaryResponse result = adminDashboardService.getAdminDashboardSummary();

        // Then the summary should contain the correct totals
        assertEquals(5, result.getPendingSignatures());
        assertEquals(4, result.getLateThisWeek());
        assertEquals(2, result.getOpenHazards());
    }

    @Test
    void testGetAdminDashboardSummaryPendingSignatureNeverBelowZero() {

        // Given more signatures are recorded than expected
        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        HazardTable hazard = new HazardTable();
        hazard.setHazardId(2L);

        when(clockInRepository.countLateClockInsThisWeek(any(), any(), any())).thenReturn(1);
        when(hazardRepository.countOpenHazards()).thenReturn(1);
        when(accountRepository.count()).thenReturn(1L);

        when(documentRepository.findAllBySignatureRequiredTrue())
                .thenReturn(List.of(document));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(5L);

        when(hazardRepository.findAllBySignatureRequiredTrueAndActionCompleteIsNull())
                .thenReturn(List.of(hazard));
        when(signatureRepository.countByHazardHazardId(2L)).thenReturn(5L);

        // When the admin dashboard summary is requested
        AdminDashboardSummaryResponse result = adminDashboardService.getAdminDashboardSummary();

        // Then pending signatures should not go below zero
        assertEquals(0, result.getPendingSignatures());
        assertEquals(1, result.getLateThisWeek());
        assertEquals(1, result.getOpenHazards());
    }

    @Test
    void testGetLateArrivalsChartDefaultsBlankRangeToThisWeek() {

        // Given blank input and two late clock-ins during the current week
        LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);

        ClockInTable mondayLate = new ClockInTable();
        mondayLate.setCreated(monday.atTime(9, 0));
        mondayLate.setClockInTime(Time.valueOf("09:00:00"));

        ClockInTable wednesdayLate = new ClockInTable();
        wednesdayLate.setCreated(monday.plusDays(2).atTime(8, 30));
        wednesdayLate.setClockInTime(Time.valueOf("08:30:00"));

        when(clockInRepository
                .findAllByCreatedGreaterThanEqualAndCreatedLessThanAndClockInTimeGreaterThan(any(), any(), any()))
                .thenReturn(List.of(mondayLate, wednesdayLate));

        // When the chart is requested with a blank range
        AdminLateArrivalsChartResponse result = adminDashboardService.getLateArrivalsChart(" ");

        // Then the range should default to this-week and the points should be grouped by weekdays
        assertEquals("this-week", result.getRange());
        assertEquals(2, result.getTotal());
        assertEquals(5, result.getPoints().size());
        assertEquals("Mon", result.getPoints().get(0).getLabel());
        assertEquals(1, result.getPoints().get(0).getValue());
        assertEquals("Wed", result.getPoints().get(2).getLabel());
        assertEquals(1, result.getPoints().get(2).getValue());
    }

    @Test
    void testGetLateArrivalsChartLastMonthIgnoresWeekendCountsInChart() {

        // Given one weekday late clock-in and one weekend late clock-in in the previous month
        LocalDate monthStart = LocalDate.now().minusMonths(1).withDayOfMonth(1);

        ClockInTable weekdayLate = new ClockInTable();
        weekdayLate.setCreated(monthStart.plusDays(1).atTime(8, 45));
        weekdayLate.setClockInTime(Time.valueOf("08:45:00"));

        LocalDate saturday = monthStart;
        while (saturday.getDayOfWeek() != DayOfWeek.SATURDAY) {
            saturday = saturday.plusDays(1);
        }

        ClockInTable weekendLate = new ClockInTable();
        weekendLate.setCreated(saturday.atTime(9, 0));
        weekendLate.setClockInTime(Time.valueOf("09:00:00"));

        when(clockInRepository
                .findAllByCreatedGreaterThanEqualAndCreatedLessThanAndClockInTimeGreaterThan(any(), any(), any()))
                .thenReturn(List.of(weekdayLate, weekendLate));

        // When the chart is requested for last month
        AdminLateArrivalsChartResponse result =
                adminDashboardService.getLateArrivalsChart("last-month");

        // Then the total raw records should be returned but weekend clock-ins should not increase chart values
        assertEquals("last-month", result.getRange());
        assertEquals(2, result.getTotal());
        assertFalse(result.getPoints().isEmpty());

        int sumOfChartValues = result.getPoints().stream()
                .mapToInt(AdminDashboardChartPointResponse::getValue)
                .sum();

        assertEquals(1, sumOfChartValues);
    }

    @Test
    void testGetLateArrivalsChartThisYearSuccess() {

        // Given late clock-ins across two different months in the current year
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);

        ClockInTable januaryLate = new ClockInTable();
        januaryLate.setCreated(yearStart.plusDays(1).atTime(8, 20));
        januaryLate.setClockInTime(Time.valueOf("08:20:00"));

        ClockInTable februaryLate = new ClockInTable();
        februaryLate.setCreated(yearStart.plusMonths(1).plusDays(1).atTime(8, 50));
        februaryLate.setClockInTime(Time.valueOf("08:50:00"));

        when(clockInRepository
                .findAllByCreatedGreaterThanEqualAndCreatedLessThanAndClockInTimeGreaterThan(any(), any(), any()))
                .thenReturn(List.of(januaryLate, februaryLate));

        // When the chart is requested for this year
        AdminLateArrivalsChartResponse result =
                adminDashboardService.getLateArrivalsChart("this-year");

        // Then the response should contain all 12 months and the correct total
        assertEquals("this-year", result.getRange());
        assertEquals(2, result.getTotal());
        assertEquals(12, result.getPoints().size());
    }

    @Test
    void testGetLateArrivalsChartUnsupportedRange() {

        // Given an unsupported chart range
        // When the chart is requested
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminDashboardService.getLateArrivalsChart("invalid")
        );

        // Then the service should reject the range
        assertEquals("Unsupported range: invalid", exception.getMessage());
    }

    @Test
    void testGetDocumentSignaturesChartThisWeekSuccess() {

        // Given two documents requiring signatures and four recorded signatures in total
        DocumentTable documentOne = new DocumentTable();
        documentOne.setDocumentId(1L);

        DocumentTable documentTwo = new DocumentTable();
        documentTwo.setDocumentId(2L);

        when(accountRepository.count()).thenReturn(4L);
        when(documentRepository
                .findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(any(), any()))
                .thenReturn(List.of(documentOne, documentTwo));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(3L);
        when(signatureRepository.countByDocumentDocumentId(2L)).thenReturn(1L);

        // When the document signatures chart is requested
        AdminDocumentSignaturesChartResponse result =
                adminDashboardService.getDocumentSignaturesChart("this-week");

        // Then the signed and pending totals should be calculated correctly
        assertEquals(4, result.getSigned());
        assertEquals(4, result.getPending());
    }

    @Test
    void testGetDocumentSignaturesChartPendingNeverBelowZero() {

        // Given more document signatures are recorded than expected
        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(accountRepository.count()).thenReturn(1L);
        when(documentRepository
                .findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(any(), any()))
                .thenReturn(List.of(document));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(5L);

        // When the document signatures chart is requested
        AdminDocumentSignaturesChartResponse result =
                adminDashboardService.getDocumentSignaturesChart("this-month");

        // Then pending signatures should not go below zero
        assertEquals(5, result.getSigned());
        assertEquals(0, result.getPending());
    }

    @Test
    void testGetDocumentSignaturesChartUnsupportedRange() {

        // Given an unsupported chart range
        // When the document signatures chart is requested
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminDashboardService.getDocumentSignaturesChart("invalid")
        );

        // Then the service should reject the range
        assertEquals("Unsupported range: invalid", exception.getMessage());
    }

    @Test
    void testGetHazardsReportedChartThisWeekSuccess() {

        // Given two hazards reported during the current week
        LocalDate monday = LocalDate.now().with(DayOfWeek.MONDAY);

        HazardTable mondayHazard = new HazardTable();
        mondayHazard.setCreated(monday.atTime(10, 0));
        mondayHazard.setTitle("Loose cable");

        HazardTable tuesdayHazard = new HazardTable();
        tuesdayHazard.setCreated(monday.plusDays(1).atTime(11, 0));
        tuesdayHazard.setTitle("Wet floor");

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(mondayHazard, tuesdayHazard));

        // When the hazards reported chart is requested
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("this-week");

        // Then the weekly chart should contain the correct weekday counts
        assertEquals("this-week", result.getRange());
        assertEquals(2, result.getTotal());
        assertEquals(5, result.getPoints().size());
        assertEquals("Mon", result.getPoints().get(0).getLabel());
        assertEquals(1, result.getPoints().get(0).getValue());
        assertEquals("Tue", result.getPoints().get(1).getLabel());
        assertEquals(1, result.getPoints().get(1).getValue());
    }

    @Test
    void testGetHazardsReportedChartLast3MonthsSuccess() {

        // Given hazards reported across each of the last three months
        LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);

        HazardTable firstMonthHazard = new HazardTable();
        firstMonthHazard.setCreated(currentMonthStart.minusMonths(2).plusDays(1).atTime(9, 0));

        HazardTable secondMonthHazard = new HazardTable();
        secondMonthHazard.setCreated(currentMonthStart.minusMonths(1).plusDays(1).atTime(9, 0));

        HazardTable thirdMonthHazard = new HazardTable();
        thirdMonthHazard.setCreated(currentMonthStart.plusDays(1).atTime(9, 0));

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(firstMonthHazard, secondMonthHazard, thirdMonthHazard));

        // When the hazards reported chart is requested
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("last-3-months");

        // Then the monthly chart should contain one point for each month in the range
        assertEquals("last-3-months", result.getRange());
        assertEquals(3, result.getTotal());
        assertEquals(3, result.getPoints().size());
    }

    @Test
    void testGetHazardsReportedChartYearBranchUsesDashYear() {

        // Given the service currently uses the literal range value '-year'
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);

        HazardTable januaryHazard = new HazardTable();
        januaryHazard.setCreated(yearStart.plusDays(1).atTime(9, 0));

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(januaryHazard));

        // When the hazards reported chart is requested using '-year'
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("-year");

        // Then the service should return a yearly chart with 12 monthly points
        assertEquals("-year", result.getRange());
        assertEquals(1, result.getTotal());
        assertEquals(12, result.getPoints().size());
    }

    @Test
    void testGetHazardsReportedChartUnsupportedRange() {

        // Given the service does not currently support 'this-year' for hazards
        // When the hazards reported chart is requested using that value
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> adminDashboardService.getHazardsReportedChart("this-year")
        );

        // Then the service should reject the range
        assertEquals("Unsupported range: this-year", exception.getMessage());
    }

    @Test
    void testGetRecentActivityReturnsNewestFiveItemsOnly() {

        // Given recent activity across signatures, leave, hazards and late clock-ins
        AccountTable johnDoe = new AccountTable();
        johnDoe.setFirstName("John");
        johnDoe.setLastName("Doe");

        AccountTable janeSmith = new AccountTable();
        janeSmith.setFirstName("Jane");
        janeSmith.setLastName("Smith");

        DocumentTable document = new DocumentTable();
        document.setTitle("Safety Policy");

        SignatureTable signature = new SignatureTable();
        signature.setAccount(johnDoe);
        signature.setDocument(document);
        signature.setCreated(LocalDateTime.now().minusMinutes(30));

        LeaveTable singleDayLeave = new LeaveTable();
        singleDayLeave.setAccount(janeSmith);
        singleDayLeave.setStartDate(LocalDate.now().plusDays(10).atTime(8, 0));
        singleDayLeave.setEndDate(LocalDate.now().plusDays(10).atTime(17, 0));
        singleDayLeave.setCreated(LocalDateTime.now().minusMinutes(10));

        LeaveTable rangeLeave = new LeaveTable();
        rangeLeave.setAccount(johnDoe);
        rangeLeave.setStartDate(LocalDate.now().plusDays(20).atTime(8, 0));
        rangeLeave.setEndDate(LocalDate.now().plusDays(22).atTime(17, 0));
        rangeLeave.setCreated(LocalDateTime.now().minusMinutes(20));

        HazardTable hazard = new HazardTable();
        hazard.setAccount(johnDoe);
        hazard.setTitle("Loose cable");
        hazard.setCreated(LocalDateTime.now().minusMinutes(5));

        ClockInTable lateClockInOne = new ClockInTable();
        lateClockInOne.setAccount(janeSmith);
        lateClockInOne.setClockInTime(Time.valueOf(LocalTime.of(8, 15)));
        lateClockInOne.setCreated(LocalDateTime.now().minusMinutes(15));

        ClockInTable lateClockInTwo = new ClockInTable();
        lateClockInTwo.setAccount(johnDoe);
        lateClockInTwo.setClockInTime(Time.valueOf(LocalTime.of(8, 45)));
        lateClockInTwo.setCreated(LocalDateTime.now().minusMinutes(25));

        when(signatureRepository.findTop10ByDocumentIsNotNullOrderByCreatedDesc())
                .thenReturn(List.of(signature));
        when(leaveRepository.findTop5ByOrderByCreatedDesc())
                .thenReturn(List.of(singleDayLeave, rangeLeave));
        when(hazardRepository.findTop10RecentNonDraftHazards())
                .thenReturn(List.of(hazard));
        when(clockInRepository.findTop10LateClockIns(any()))
                .thenReturn(List.of(lateClockInOne, lateClockInTwo));

        // When recent activity is requested
        List<AdminRecentActivityItemResponse> result =
                adminDashboardService.getRecentActivity();

        // Then only the newest five items should be returned in descending created order
        assertEquals(5, result.size());

        assertEquals("HAZARD_REPORTED", result.get(0).getType());
        assertTrue(result.get(0).getMessage().contains("John Doe reported Loose cable"));

        assertEquals("LEAVE_REQUEST", result.get(1).getType());
        assertTrue(result.get(1).getMessage().contains("Jane Smith has requested leave for"));

        assertEquals("LATE_CLOCK_IN", result.get(2).getType());
        assertTrue(result.get(2).getMessage().contains("15 minutes late"));

        assertEquals("LEAVE_REQUEST", result.get(3).getType());
        assertTrue(result.get(3).getMessage().contains(" - "));

        assertEquals("LATE_CLOCK_IN", result.get(4).getType());
        assertTrue(result.get(4).getMessage().contains("45 minutes late"));
    }

    @Test
    void testGetRecentActivityOnTimeClockInProducesZeroMinutesLate() {

        // Given a clock-in exactly at the late threshold time
        AccountTable account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");

        ClockInTable onTimeClockIn = new ClockInTable();
        onTimeClockIn.setAccount(account);
        onTimeClockIn.setClockInTime(Time.valueOf(LocalTime.of(8, 0)));
        onTimeClockIn.setCreated(LocalDateTime.now());

        when(signatureRepository.findTop10ByDocumentIsNotNullOrderByCreatedDesc())
                .thenReturn(List.of());
        when(leaveRepository.findTop5ByOrderByCreatedDesc())
                .thenReturn(List.of());
        when(hazardRepository.findTop10RecentNonDraftHazards())
                .thenReturn(List.of());
        when(clockInRepository.findTop10LateClockIns(any()))
                .thenReturn(List.of(onTimeClockIn));

        // When recent activity is requested
        List<AdminRecentActivityItemResponse> result =
                adminDashboardService.getRecentActivity();

        // Then the clock-in should be shown as zero minutes late
        assertEquals(1, result.size());
        assertEquals("LATE_CLOCK_IN", result.getFirst().getType());
        assertTrue(result.getFirst().getMessage().contains("John Doe clocked in 0 minutes late"));
    }

    @Test
    void testGetHazardsReportedChartLastWeekSuccess() {

        // Given one hazard reported during the previous week
        LocalDate lastWeekMonday = LocalDate.now().with(DayOfWeek.MONDAY).minusWeeks(1);

        HazardTable lastWeekHazard = new HazardTable();
        lastWeekHazard.setCreated(lastWeekMonday.plusDays(1).atTime(10, 0));
        lastWeekHazard.setTitle("Broken step");

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(lastWeekHazard));

        // When the hazards reported chart is requested for last week
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("last-week");

        // Then the daily chart for last week should be returned
        assertEquals("last-week", result.getRange());
        assertEquals(1, result.getTotal());
        assertEquals(5, result.getPoints().size());
        assertEquals(1, result.getPoints().stream().mapToInt(AdminDashboardChartPointResponse::getValue).sum());
    }

    @Test
    void testGetHazardsReportedChartThisMonthSuccess() {

        // Given hazards reported in different weeks of the current month
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);

        HazardTable weekOneHazard = new HazardTable();
        weekOneHazard.setCreated(monthStart.plusDays(1).atTime(9, 0));

        HazardTable weekTwoHazard = new HazardTable();
        weekTwoHazard.setCreated(monthStart.plusDays(8).atTime(9, 0));

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(weekOneHazard, weekTwoHazard));

        // When the hazards reported chart is requested for this month
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("this-month");

        // Then the weekly chart should be built for the current month
        assertEquals("this-month", result.getRange());
        assertEquals(2, result.getTotal());
        assertFalse(result.getPoints().isEmpty());
        assertTrue(result.getPoints().stream().anyMatch(point -> point.getValue() == 1));
    }

    @Test
    void testGetHazardsReportedChartLastMonthSuccess() {

        // Given hazards reported in different weeks of the previous month
        LocalDate monthStart = LocalDate.now().minusMonths(1).withDayOfMonth(1);

        HazardTable weekOneHazard = new HazardTable();
        weekOneHazard.setCreated(monthStart.plusDays(2).atTime(9, 0));

        HazardTable weekThreeHazard = new HazardTable();
        weekThreeHazard.setCreated(monthStart.plusDays(16).atTime(9, 0));

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(weekOneHazard, weekThreeHazard));

        // When the hazards reported chart is requested for last month
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("last-month");

        // Then the weekly chart should be built for the previous month
        assertEquals("last-month", result.getRange());
        assertEquals(2, result.getTotal());
        assertFalse(result.getPoints().isEmpty());
        assertEquals(2, result.getPoints().stream().mapToInt(AdminDashboardChartPointResponse::getValue).sum());
    }

    @Test
    void testGetHazardsReportedChartLast6MonthsSuccess() {

        // Given hazards reported across the last six months
        LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);

        HazardTable firstHazard = new HazardTable();
        firstHazard.setCreated(currentMonthStart.minusMonths(5).plusDays(1).atTime(9, 0));

        HazardTable secondHazard = new HazardTable();
        secondHazard.setCreated(currentMonthStart.minusMonths(3).plusDays(1).atTime(9, 0));

        HazardTable thirdHazard = new HazardTable();
        thirdHazard.setCreated(currentMonthStart.minusMonths(1).plusDays(1).atTime(9, 0));

        when(hazardRepository.findAllNonDraftCreatedBetween(any(), any()))
                .thenReturn(List.of(firstHazard, secondHazard, thirdHazard));

        // When the hazards reported chart is requested for the last six months
        AdminHazardsReportedChartResponse result =
                adminDashboardService.getHazardsReportedChart("last-6-months");

        // Then the monthly chart should contain six monthly points
        assertEquals("last-6-months", result.getRange());
        assertEquals(3, result.getTotal());
        assertEquals(6, result.getPoints().size());
    }

    @Test
    void testGetDocumentSignaturesChartLastMonthSuccess() {

        // Given one document in the previous month requiring signatures
        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(accountRepository.count()).thenReturn(3L);
        when(documentRepository
                .findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(any(), any()))
                .thenReturn(List.of(document));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(1L);

        // When the document signatures chart is requested for last month
        AdminDocumentSignaturesChartResponse result =
                adminDashboardService.getDocumentSignaturesChart("last-month");

        // Then the correct signed and pending totals should be returned
        assertEquals(1, result.getSigned());
        assertEquals(2, result.getPending());
    }

    @Test
    void testGetDocumentSignaturesChartLast3MonthsSuccess() {

        // Given one document in the last three months requiring signatures
        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(accountRepository.count()).thenReturn(2L);
        when(documentRepository
                .findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(any(), any()))
                .thenReturn(List.of(document));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(1L);

        // When the document signatures chart is requested for the last three months
        AdminDocumentSignaturesChartResponse result =
                adminDashboardService.getDocumentSignaturesChart("last-3-months");

        // Then the totals should be calculated correctly
        assertEquals(1, result.getSigned());
        assertEquals(1, result.getPending());
    }

    @Test
    void testGetLateArrivalsChartLast6MonthsSuccess() {

        // Given late clock-ins across the last six months including a weekend clock-in
        LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);

        ClockInTable firstLate = new ClockInTable();
        firstLate.setCreated(
                currentMonthStart.minusMonths(5).plusDays(1).atTime(8, 20));
        firstLate.setClockInTime(
                Time.valueOf("08:20:00"));

        ClockInTable secondLate = new ClockInTable();
        secondLate.setCreated(
                currentMonthStart.minusMonths(2).plusDays(1).atTime(8, 40));
        secondLate.setClockInTime(Time.valueOf("08:40:00"));

        LocalDate saturday = currentMonthStart.minusMonths(1);
        while (saturday.getDayOfWeek() != DayOfWeek.SATURDAY) {
            saturday = saturday.plusDays(1);
        }

        ClockInTable weekendLate = new ClockInTable();
        weekendLate.setCreated(saturday.atTime(9, 0));
        weekendLate.setClockInTime(Time.valueOf("09:00:00"));

        when(clockInRepository
                .findAllByCreatedGreaterThanEqualAndCreatedLessThanAndClockInTimeGreaterThan(any(), any(), any()))
                .thenReturn(List.of(firstLate, secondLate, weekendLate));

        // When the chart is requested for the last six months
        AdminLateArrivalsChartResponse result =
                adminDashboardService.getLateArrivalsChart("last-6-months");

        // Then the response should contain six monthly points and ignore weekends in the plotted totals
        assertEquals("last-6-months", result.getRange());
        assertEquals(3, result.getTotal());
        assertEquals(6, result.getPoints().size());

        int sumOfChartValues = result.getPoints().stream()
                .mapToInt(AdminDashboardChartPointResponse::getValue)
                .sum();

        assertEquals(1, sumOfChartValues);
    }

    @Test
    void testGetDocumentSignaturesChartLastWeekSuccess() {

        // Given one document in the previous week requiring signatures
        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(accountRepository.count()).thenReturn(4L);
        when(documentRepository
                .findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(any(), any()))
                .thenReturn(List.of(document));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(2L);

        // When the document signatures chart is requested for last week
        AdminDocumentSignaturesChartResponse result =
                adminDashboardService.getDocumentSignaturesChart("last-week");

        // Then the signed and pending totals should be returned correctly
        assertEquals(2, result.getSigned());
        assertEquals(2, result.getPending());
    }

    @Test
    void testGetDocumentSignaturesChartLast6MonthsSuccess() {

        // Given two documents in the last six months requiring signatures
        DocumentTable documentOne = new DocumentTable();
        documentOne.setDocumentId(1L);

        DocumentTable documentTwo = new DocumentTable();
        documentTwo.setDocumentId(2L);

        when(accountRepository.count()).thenReturn(2L);
        when(documentRepository
                .findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(any(), any()))
                .thenReturn(List.of(documentOne, documentTwo));
        when(signatureRepository.countByDocumentDocumentId(1L)).thenReturn(1L);
        when(signatureRepository.countByDocumentDocumentId(2L)).thenReturn(0L);

        // When the document signatures chart is requested for the last six months
        AdminDocumentSignaturesChartResponse result =
                adminDashboardService.getDocumentSignaturesChart("last-6-months");

        // Then the totals should be calculated correctly
        assertEquals(1, result.getSigned());
        assertEquals(3, result.getPending());
    }


}
