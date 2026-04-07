package uk.co.garagebridgend.backend.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.response.*;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;
import uk.co.garagebridgend.backend.models.response.AdminRecentActivityItemResponse;
import uk.co.garagebridgend.backend.repository.LeaveRepository;

import java.sql.Time;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.time.Duration;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;

/**
 * Service class for handling business logic related to the admin dashboard.
 */
@Service
public class AdminDashboardService {
    /** Number of days in a week. */
    private static final int NUMBER_OF_DAYS_IN_A_WEEK  = 7;

    /** Number of working days in a week, used for weekly grouping. */
    private static final int NUMBER_OF_WORKING_DAYS_IN_A_WEEK = 5;

    /** Number of months for the last 3 months range. */
    private static final int THREE_MONTHS = 3;

    /** Number of months for the last 6 months range. */
    private static final int SIX_MONTHS = 6;

    /** Maximum number of recent activity items to return. */
    private static final int RECENT_ACTIVITY_LIMIT = 5;

    /** Threshold after which a clock-in is considered late. */
    private static final LocalTime LATE_CLOCK_IN_THRESHOLD = LocalTime.of(8, 0);

    /** Formatter used for leave date display in recent activity messages. */
    private static final DateTimeFormatter LEAVE_DATE_FORMATTER = DateTimeFormatter.ofPattern("d MMMM");

    /** Repository to access clock-in data. */
    private final ClockInRepository clockInRepository;

    /** Repository to access hazard data. */
    private final HazardRepository hazardRepository;

    /** Repository to access account data. */
    private final AccountRepository accountRepository;

    /** Repository to access document data. */
    private final DocumentRepository documentRepository;

    /** Repository to access signature data. */
    private final SignatureRepository signatureRepository;

    /** Repository to access leave request data. */
    private final LeaveRepository leaveRepository;

    /**
     * Constructs the AdminDashboardService with the required repositories.
     *
     * @param hazardRepositoryImpl    repository for HazardTable
     * @param clockInRepositoryImpl  repository for ClockInTable
     * @param accountRepositoryImpl  repository for AccountTable
     * @param documentRepositoryImpl repository for DocumentTable
     * @param signatureRepositoryImpl repository for SignatureTable
     * @param leaveRepositoryImpl repository for LeaveTable
     */
    @Autowired
    public AdminDashboardService(
            final ClockInRepository clockInRepositoryImpl,
            final HazardRepository hazardRepositoryImpl,
            final AccountRepository accountRepositoryImpl,
            final DocumentRepository documentRepositoryImpl,
            final SignatureRepository signatureRepositoryImpl,
            final LeaveRepository leaveRepositoryImpl
            ) {
        this.hazardRepository = hazardRepositoryImpl;
        this.clockInRepository = clockInRepositoryImpl;
        this.accountRepository = accountRepositoryImpl;
        this.documentRepository = documentRepositoryImpl;
        this.signatureRepository = signatureRepositoryImpl;
        this.leaveRepository = leaveRepositoryImpl;
    }


    /**
     * Retrieves a summary of the key metrics for the admin dashboard, including
     * pending signatures, late arrivals this week, and open hazards.
     *
     * @return AdminDashboardSummaryResponse containing pending signatures,
     * late arrivals this week, and open hazards
     */
    public AdminDashboardSummaryResponse getAdminDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeekDate = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeekDate = startOfWeekDate.plusDays(NUMBER_OF_DAYS_IN_A_WEEK);

        LocalDateTime startOfWeek = startOfWeekDate.atStartOfDay();
        LocalDateTime endOfWeek = endOfWeekDate.atStartOfDay();

        Time lateThreshold = Time.valueOf("08:00:00");

        int lateThisWeek = clockInRepository.countLateClockInsThisWeek(
                lateThreshold,
                startOfWeek,
                endOfWeek
        );

        int openHazards = hazardRepository.countOpenHazards();

        long pendingSignatures = getPendingDocumentSignatures() + getPendingHazardSignatures();

        return new AdminDashboardSummaryResponse(
                pendingSignatures,
                lateThisWeek,
                openHazards
        );
    }

    /**
     * Calculates the total number of pending document signatures.
     *
     * @return the total number of pending document signatures
     */
    private long getPendingDocumentSignatures() {
        long totalAccounts = accountRepository.count();
        List<DocumentTable> documentsRequiringSignatures = documentRepository.findAllBySignatureRequiredTrue();
        long documentSignaturesExpected = totalAccounts * documentsRequiringSignatures.size();

        long pendingDocumentSignatures = 0;
        long recordedSignatures = 0;

        for (DocumentTable document : documentsRequiringSignatures) {
            recordedSignatures += signatureRepository.countByDocumentDocumentId(document.getDocumentId());
        }
        long missingSignatures = documentSignaturesExpected - recordedSignatures;

        pendingDocumentSignatures += Math.toIntExact(Math.max(0, missingSignatures));

        return pendingDocumentSignatures;
    }

    /**
     * Calculates the total number of pending hazard signatures.
     *
     * @return the total number of pending hazard signatures
     */
    private long getPendingHazardSignatures() {
        long totalAccounts = accountRepository.count();
        List<HazardTable> hazardsRequiringSignatures =
                hazardRepository.findAllBySignatureRequiredTrueAndActionCompleteIsNull();
        long hazardSignaturesExpected = totalAccounts * hazardsRequiringSignatures.size();

        long pendingSignatures = 0;
        long recordedSignatures = 0;

        for (HazardTable hazard : hazardsRequiringSignatures) {
            recordedSignatures += signatureRepository.countByHazardHazardId(hazard.getHazardId());
        }
        long missingSignatures = hazardSignaturesExpected - recordedSignatures;

        pendingSignatures += Math.toIntExact(Math.max(0, missingSignatures));

        return pendingSignatures;
    }

    /**
     * Retrieves chart data for late arrivals for the selected range.
     *
     * @param range the selected range, e.g. this-week, last-week, this-month
     * @return AdminLateArrivalsChartResponse containing chart data for the selected range
     */
    public AdminLateArrivalsChartResponse getLateArrivalsChart(final String range) {
        String normalisedRange = normaliseRange(range);

        return switch (normalisedRange) {
            case "this-week" -> buildDailyLateArrivalsChart(normalisedRange, getStartOfCurrentWeek());
            case "last-week" -> buildDailyLateArrivalsChart(normalisedRange, getStartOfCurrentWeek().minusWeeks(1));
            case "this-month" -> buildWeeklyLateArrivalsChart(normalisedRange, LocalDate.now().withDayOfMonth(1));
            case "last-month" -> buildWeeklyLateArrivalsChart(
                    normalisedRange,
                    LocalDate.now().minusMonths(1).withDayOfMonth(1)
            );
            case "last-3-months" -> buildMonthlyLateArrivalsChart(normalisedRange, THREE_MONTHS);
            case "last-6-months" -> buildMonthlyLateArrivalsChart(normalisedRange, SIX_MONTHS);
            case "this-year" -> buildThisYearLateArrivalsChart(normalisedRange);
            default -> throw new IllegalArgumentException("Unsupported range: " + range);
        };
    }

    /**
     * Normalises the supplied range or defaults it to this-week.
     *
     * @param range the incoming range value
     * @return a normalised range string
     */
    private String normaliseRange(final String range) {
        return (range == null || range.isBlank()) ? "this-week" : range.toLowerCase();
    }

    /**
     * Gets the Monday of the current week.
     *
     * @return the start of the current week
     */
    private LocalDate getStartOfCurrentWeek() {
        return LocalDate.now().with(DayOfWeek.MONDAY);
    }

    /**
     * Builds a late arrivals chart grouped by day.
     *
     * @param range the selected range
     * @param startDate the start date of the week
     * @return chart response grouped by day
     */
    private AdminLateArrivalsChartResponse buildDailyLateArrivalsChart(
            final String range,
            final LocalDate startDate
    ) {
        LocalDate endDate = startDate.plusDays(NUMBER_OF_WORKING_DAYS_IN_A_WEEK);
        List<ClockInTable> lateClockIns = getLateClockInsBetween(startDate, endDate);

        Map<LocalDate, Integer> counts = new LinkedHashMap<>();
        for (int i = 0; i < NUMBER_OF_WORKING_DAYS_IN_A_WEEK; i++) {
            counts.put(startDate.plusDays(i), 0);
        }

        for (ClockInTable clockIn : lateClockIns) {
            LocalDate day = clockIn.getCreated().toLocalDate();
            counts.computeIfPresent(day, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<LocalDate, Integer> entry : counts.entrySet()) {
            String label = entry.getKey().getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.UK);
            points.add(new AdminDashboardChartPointResponse(label, entry.getValue()));
        }

        return new AdminLateArrivalsChartResponse(range, lateClockIns.size(), points);
    }

    /**
     * Builds a late arrivals chart grouped by week-of-month.
     *
     * @param range the selected range
     * @param monthStart the first day of the target month
     * @return chart response grouped by week
     */
    private AdminLateArrivalsChartResponse buildWeeklyLateArrivalsChart(
            final String range,
            final LocalDate monthStart
    ) {
        LocalDate monthEnd = monthStart.plusMonths(1);
        List<ClockInTable> lateClockIns = getLateClockInsBetween(monthStart, monthEnd);

        int numberOfWeeks = (int) Math.ceil((double) monthStart.lengthOfMonth() / NUMBER_OF_DAYS_IN_A_WEEK) - 1;
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        for (int week = 1; week <= numberOfWeeks; week++) {
            counts.put(week, 0);
        }

        for (ClockInTable clockIn : lateClockIns) {
            if (clockIn.getCreated().getDayOfWeek() == DayOfWeek.SATURDAY
                    || clockIn.getCreated().getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            int weekOfMonth = ((clockIn.getCreated().getDayOfMonth() - 1) / NUMBER_OF_DAYS_IN_A_WEEK) + 1;
            counts.computeIfPresent(weekOfMonth, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
            points.add(new AdminDashboardChartPointResponse("Week " + entry.getKey(), entry.getValue()));
        }

        return new AdminLateArrivalsChartResponse(range, lateClockIns.size(), points);
    }

    /**
     * Builds a late arrivals chart grouped by month for the previous number of months.
     *
     * @param range the selected range
     * @param numberOfMonths the number of months to include
     * @return chart response grouped by month
     */
    private AdminLateArrivalsChartResponse buildMonthlyLateArrivalsChart(
            final String range,
            final int numberOfMonths
    ) {
        LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate startDate = currentMonthStart.minusMonths(numberOfMonths - 1);
        LocalDate endDate = currentMonthStart.plusMonths(1);

        List<ClockInTable> lateClockIns = getLateClockInsBetween(startDate, endDate);

        Map<Month, Integer> counts = new LinkedHashMap<>();
        LocalDate cursor = startDate;
        for (int i = 0; i < numberOfMonths; i++) {
            counts.put(cursor.getMonth(), 0);
            cursor = cursor.plusMonths(1);
        }

        for (ClockInTable clockIn : lateClockIns) {
            if (clockIn.getCreated().getDayOfWeek() == DayOfWeek.SATURDAY
                    || clockIn.getCreated().getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }

            Month month = clockIn.getCreated().getMonth();
            counts.computeIfPresent(month, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<Month, Integer> entry : counts.entrySet()) {
            String label = entry.getKey().getDisplayName(TextStyle.SHORT, Locale.UK);
            points.add(new AdminDashboardChartPointResponse(label, entry.getValue()));
        }

        return new AdminLateArrivalsChartResponse(range, lateClockIns.size(), points);
    }

    /**
     * Builds a late arrivals chart grouped by month for the current year.
     *
     * @param range the selected range
     * @return chart response grouped by month
     */
    private AdminLateArrivalsChartResponse buildThisYearLateArrivalsChart(final String range) {
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);
        LocalDate yearEnd = yearStart.plusYears(1);

        List<ClockInTable> lateClockIns = getLateClockInsBetween(yearStart, yearEnd);

        Map<Month, Integer> counts = new LinkedHashMap<>();
        for (Month month : Month.values()) {
            counts.put(month, 0);
        }

        for (ClockInTable clockIn : lateClockIns) {
            if (clockIn.getCreated().getDayOfWeek() == DayOfWeek.SATURDAY
                    || clockIn.getCreated().getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }

            Month month = clockIn.getCreated().getMonth();
            counts.computeIfPresent(month, (key, value) -> value + 1);
        }
        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<Month, Integer> entry : counts.entrySet()) {
            String label = entry.getKey().getDisplayName(TextStyle.SHORT, Locale.UK);
            points.add(new AdminDashboardChartPointResponse(label, entry.getValue()));
        }

        return new AdminLateArrivalsChartResponse(range, lateClockIns.size(), points);
    }

    /**
     * Retrieves all late clock-ins between the given dates.
     *
     * @param startDate the inclusive start date
     * @param endDate the exclusive end date
     * @return a list of late clock-ins in the range
     */
    private List<ClockInTable> getLateClockInsBetween(final LocalDate startDate, final LocalDate endDate) {
        Time lateThreshold = Time.valueOf("08:00:00");

        return clockInRepository.findAllByCreatedGreaterThanEqualAndCreatedLessThanAndClockInTimeGreaterThan(
                startDate.atStartOfDay(),
                endDate.atStartOfDay(),
                lateThreshold
        );
    }

    /**
     * Retrieves document signature totals for the admin dashboard for the given range.
     *
     * @param range the selected range, e.g. this week, last week, this month...
     * @return AdminDocumentSignaturesChartResponse containing signed and pending totals
     */
    public AdminDocumentSignaturesChartResponse getDocumentSignaturesChart(final String range) {
        String normalisedRange = normaliseRange(range);

        LocalDate startDate;
        LocalDate endDate;

        switch (normalisedRange) {
            case "this-week" -> {
                startDate = getStartOfCurrentWeek();
                endDate = startDate.plusDays(NUMBER_OF_DAYS_IN_A_WEEK);
            }
            case "last-week" -> {
                startDate = getStartOfCurrentWeek().minusWeeks(1);
                endDate = startDate.plusDays(NUMBER_OF_DAYS_IN_A_WEEK);
            }
            case "this-month" -> {
                startDate = LocalDate.now().withDayOfMonth(1);
                endDate = startDate.plusMonths(1);
            }
            case "last-month" -> {
                startDate = LocalDate.now().minusMonths(1).withDayOfMonth(1);
                endDate = startDate.plusMonths(1);
            }
            case "last-3-months" -> {
                endDate = LocalDate.now().withDayOfMonth(1).plusMonths(1);
                startDate = endDate.minusMonths(THREE_MONTHS);
            }
            case "last-6-months" -> {
                endDate = LocalDate.now().withDayOfMonth(1).plusMonths(1);
                startDate = endDate.minusMonths(SIX_MONTHS);
            }
            case "this-year" -> {
                startDate = LocalDate.now().withDayOfYear(1);
                endDate = startDate.plusYears(1);
            }
            default -> throw new IllegalArgumentException("Unsupported range: " + range);
        }

        long totalAccounts = accountRepository.count();

        List<DocumentTable> documentsRequiringSignatures =
                documentRepository.findAllBySignatureRequiredTrueAndCreatedGreaterThanEqualAndCreatedLessThan(
                        startDate.atStartOfDay(),
                        endDate.atStartOfDay()
                );

        long totalExpectedSignatures = totalAccounts * documentsRequiringSignatures.size();
        long totalRecordedSignatures = 0;

        for (DocumentTable document : documentsRequiringSignatures) {
            totalRecordedSignatures += signatureRepository.countByDocumentDocumentId(document.getDocumentId());
        }

        long totalPendingSignatures = Math.max(0, totalExpectedSignatures - totalRecordedSignatures);

        return new AdminDocumentSignaturesChartResponse(
                totalRecordedSignatures,
                totalPendingSignatures
        );
    }

    /**
     * Retrieves chart data for hazards reported for the selected range.
     *
     * @param range the selected range, e.g. this-week, last-week, this-month
     * @return AdminHazardsReportedChartResponse containing chart data for the selected range
     */
    public AdminHazardsReportedChartResponse getHazardsReportedChart(final String range) {
        String normalisedRange = normaliseRange(range);

        return switch (normalisedRange) {
            case "this-week" -> buildDailyHazardsReportedChart(normalisedRange, getStartOfCurrentWeek());
            case "last-week" -> buildDailyHazardsReportedChart(normalisedRange, getStartOfCurrentWeek().minusWeeks(1));
            case "this-month" -> buildWeeklyHazardsReportedChart(normalisedRange, LocalDate.now().withDayOfMonth(1));
            case "last-month" -> buildWeeklyHazardsReportedChart(
                    normalisedRange,
                    LocalDate.now().minusMonths(1).withDayOfMonth(1)
            );
            case "last-3-months" -> buildMonthlyHazardsReportedChart(normalisedRange, THREE_MONTHS);
            case "last-6-months" -> buildMonthlyHazardsReportedChart(normalisedRange, SIX_MONTHS);
            case "-year" -> buildThisYearHazardsReportedChart(normalisedRange);
            default -> throw new IllegalArgumentException("Unsupported range: " + range);
        };
    }

    /**
     * Builds a hazards reported chart grouped by day.
     *
     * @param range the selected range
     * @param startDate the start date of the week
     * @return chart response grouped by day
     */
    private AdminHazardsReportedChartResponse buildDailyHazardsReportedChart(
            final String range,
            final LocalDate startDate
    ) {
        LocalDate endDate = startDate.plusDays(NUMBER_OF_WORKING_DAYS_IN_A_WEEK);
        List<HazardTable> hazards = getHazardsReportedBetween(startDate, endDate);

        Map<LocalDate, Integer> counts = new LinkedHashMap<>();
        for (int i = 0; i < NUMBER_OF_WORKING_DAYS_IN_A_WEEK; i++) {
            counts.put(startDate.plusDays(i), 0);
        }

        for (HazardTable hazard : hazards) {
            LocalDate day = hazard.getCreated().toLocalDate();
            counts.computeIfPresent(day, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<LocalDate, Integer> entry : counts.entrySet()) {
            String label = entry.getKey().getDayOfWeek()
                    .getDisplayName(TextStyle.SHORT, Locale.UK);
            points.add(new AdminDashboardChartPointResponse(label, entry.getValue()));
        }

        return new AdminHazardsReportedChartResponse(range, hazards.size(), points);
    }

    /**
     * Builds a hazards reported chart grouped by week-of-month.
     *
     * @param range the selected range
     * @param monthStart the first day of the target month
     * @return chart response grouped by week
     */
    private AdminHazardsReportedChartResponse buildWeeklyHazardsReportedChart(
            final String range,
            final LocalDate monthStart
    ) {
        LocalDate monthEnd = monthStart.plusMonths(1);
        List<HazardTable> hazards = getHazardsReportedBetween(monthStart, monthEnd);

        int numberOfWeeks = (int) Math.ceil((double) monthStart.lengthOfMonth() / NUMBER_OF_DAYS_IN_A_WEEK) - 1;
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        for (int week = 1; week <= numberOfWeeks; week++) {
            counts.put(week, 0);
        }

        for (HazardTable hazard : hazards) {
            int weekOfMonth = ((hazard.getCreated().getDayOfMonth() - 1) / NUMBER_OF_DAYS_IN_A_WEEK) + 1;
            counts.computeIfPresent(weekOfMonth, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
            points.add(new AdminDashboardChartPointResponse("Week " + entry.getKey(), entry.getValue()));
        }

        return new AdminHazardsReportedChartResponse(range, hazards.size(), points);
    }

    /**
     * Builds a hazards reported chart grouped by month for the previous number of months.
     *
     * @param range the selected range
     * @param numberOfMonths the number of months to include
     * @return chart response grouped by month
     */
    private AdminHazardsReportedChartResponse buildMonthlyHazardsReportedChart(
            final String range,
            final int numberOfMonths
    ) {
        LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate startDate = currentMonthStart.minusMonths(numberOfMonths - 1);
        LocalDate endDate = currentMonthStart.plusMonths(1);

        List<HazardTable> hazards = getHazardsReportedBetween(startDate, endDate);

        Map<Month, Integer> counts = new LinkedHashMap<>();
        LocalDate cursor = startDate;
        for (int i = 0; i < numberOfMonths; i++) {
            counts.put(cursor.getMonth(), 0);
            cursor = cursor.plusMonths(1);
        }

        for (HazardTable hazard : hazards) {
            Month month = hazard.getCreated().getMonth();
            counts.computeIfPresent(month, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<Month, Integer> entry : counts.entrySet()) {
            String label = entry.getKey().getDisplayName(TextStyle.SHORT, Locale.UK);
            points.add(new AdminDashboardChartPointResponse(label, entry.getValue()));
        }

        return new AdminHazardsReportedChartResponse(range, hazards.size(), points);
    }

    /**
     * Builds a hazards reported chart grouped by month for the current year.
     *
     * @param range the selected range
     * @return chart response grouped by month
     */
    private AdminHazardsReportedChartResponse buildThisYearHazardsReportedChart(final String range) {
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);
        LocalDate yearEnd = yearStart.plusYears(1);

        List<HazardTable> hazards = getHazardsReportedBetween(yearStart, yearEnd);

        Map<Month, Integer> counts = new LinkedHashMap<>();
        for (Month month : Month.values()) {
            counts.put(month, 0);
        }

        for (HazardTable hazard : hazards) {
            Month month = hazard.getCreated().getMonth();
            counts.computeIfPresent(month, (key, value) -> value + 1);
        }

        List<AdminDashboardChartPointResponse> points = new ArrayList<>();
        for (Map.Entry<Month, Integer> entry : counts.entrySet()) {
            String label = entry.getKey().getDisplayName(TextStyle.SHORT, Locale.UK);
            points.add(new AdminDashboardChartPointResponse(label, entry.getValue()));
        }

        return new AdminHazardsReportedChartResponse(range, hazards.size(), points);
    }

    /**
     * Retrieves all hazards reported between the given dates.
     *
     * @param startDate the inclusive start date
     * @param endDate the exclusive end date
     * @return a list of hazards reported in the range
     */
    private List<HazardTable> getHazardsReportedBetween(final LocalDate startDate, final LocalDate endDate) {
        return hazardRepository.findAllNonDraftCreatedBetween(
                startDate.atStartOfDay(),
                endDate.atStartOfDay()
        );
    }

    /**
     * Retrieves the most recent admin dashboard activity items across
     * signatures, leave requests, hazard reports, and late clock-ins.
     *
     * @return a list of recent activity items ordered by newest first
     */
    public List<AdminRecentActivityItemResponse> getRecentActivity() {
        List<AdminRecentActivityItemResponse> activityItems = new ArrayList<>();

        activityItems.addAll(getRecentDocumentSignatureActivity());
        activityItems.addAll(getRecentLeaveRequestActivity());
        activityItems.addAll(getRecentHazardReportedActivity());
        activityItems.addAll(getRecentLateClockInActivity());

        return activityItems.stream()
                .sorted(Comparator.comparing(AdminRecentActivityItemResponse::getCreated).reversed())
                .limit(RECENT_ACTIVITY_LIMIT)
                .toList();
    }

    /**
     * Retrieves recent document signature activity.
     *
     * @return a list of recent activity items for signed documents
     */
    private List<AdminRecentActivityItemResponse> getRecentDocumentSignatureActivity() {
        return signatureRepository.findTop10ByDocumentIsNotNullOrderByCreatedDesc()
                .stream()
                .map(signature -> new AdminRecentActivityItemResponse(
                        "DOCUMENT_SIGNED",
                        buildFullName(signature.getAccount().getFirstName(), signature.getAccount().getLastName())
                                + " signed "
                                + signature.getDocument().getTitle(),
                        signature.getCreated()
                ))
                .toList();
    }

    /**
     * Retrieves recent leave request activity.
     *
     * @return a list of recent activity items for leave requests
     */
    private List<AdminRecentActivityItemResponse> getRecentLeaveRequestActivity() {
        return leaveRepository.findTop5ByOrderByCreatedDesc()
                .stream()
                .map(leave -> new AdminRecentActivityItemResponse(
                        "LEAVE_REQUEST",
                        buildFullName(leave.getAccount().getFirstName(), leave.getAccount().getLastName())
                                + " has requested leave for "
                                + formatLeaveDateRange(leave),
                        leave.getCreated()
                ))
                .toList();
    }

    /**
     * Retrieves recent hazard report activity.
     *
     * @return a list of recent activity items for hazard reports
     */
    private List<AdminRecentActivityItemResponse> getRecentHazardReportedActivity() {
        return hazardRepository.findTop10RecentNonDraftHazards()
                .stream()
                .map(hazard -> new AdminRecentActivityItemResponse(
                        "HAZARD_REPORTED",
                        buildFullName(hazard.getAccount().getFirstName(), hazard.getAccount().getLastName())
                                + " reported "
                                + hazard.getTitle(),
                        hazard.getCreated()
                ))
                .toList();
    }

    /**
     * Retrieves recent late clock-in activity.
     *
     * @return a list of recent activity items for late clock-ins
     */
    private List<AdminRecentActivityItemResponse> getRecentLateClockInActivity() {
        Time lateThreshold = Time.valueOf(LATE_CLOCK_IN_THRESHOLD);

        return clockInRepository.findTop10LateClockIns(lateThreshold)
                .stream()
                .map(clockIn -> new AdminRecentActivityItemResponse(
                        "LATE_CLOCK_IN",
                        buildFullName(clockIn.getAccount().getFirstName(), clockIn.getAccount().getLastName())
                                + " clocked in "
                                + getMinutesLate(clockIn)
                                + " minutes late",
                        clockIn.getCreated()
                ))
                .toList();
    }

    /**
     * Builds a full name from a first and last name.
     *
     * @param firstName the first name
     * @param lastName the last name
     * @return the combined full name
     */
    private String buildFullName(final String firstName, final String lastName) {
        return firstName + " " + lastName;
    }

    /**
     * Formats the leave booked.
     *
     * @param leave the leave request
     * @return formatted leave date text
     */
    private String formatLeaveDateRange(final LeaveTable leave) {
        String startDate = leave.getStartDate().toLocalDate().format(LEAVE_DATE_FORMATTER);
        String endDate = leave.getEndDate().toLocalDate().format(LEAVE_DATE_FORMATTER);

        if (leave.getStartDate().toLocalDate().equals(leave.getEndDate().toLocalDate())) {
            return startDate;
        }

        return startDate + " - " + endDate;
    }

    /**
     * Calculates how many minutes late a clock-in was.
     *
     * @param clockIn the clock-in record
     * @return the number of minutes late
     */
    private long getMinutesLate(final ClockInTable clockIn) {
        LocalTime actualClockIn = clockIn.getClockInTime().toLocalTime();

        if (!actualClockIn.isAfter(LATE_CLOCK_IN_THRESHOLD)) {
            return 0;
        }

        return Duration.between(LATE_CLOCK_IN_THRESHOLD, actualClockIn).toMinutes();
    }
}
