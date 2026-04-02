package uk.co.garagebridgend.backend.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.response.AdminDashboardSummaryResponse;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;

import java.sql.Time;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service class for handling business logic related to the admin dashboard.
 */
@Service
public class AdminDashboardService {
    /** Number of days in a week. */
    private static final int NUMBER_OF_DAYS_IN_A_WEEK  = 7;

    /** Repository to access clock-in data. */
    private final ClockInRepository clockInRepository;

    /** Repository to access hazard data. */
    private final HazardRepository hazardRepository;

    /**
     * Constructs the HsOverviewService with the required repositories.
     *
     * @param hazardRepositoryImpl    repository for HazardTable
     * @param clockInRepositoryImpl  repository for ClockInTable
     */
    @Autowired
    public AdminDashboardService(
            final ClockInRepository clockInRepositoryImpl,
            final HazardRepository hazardRepositoryImpl) {
        this.hazardRepository = hazardRepositoryImpl;
        this.clockInRepository = clockInRepositoryImpl;
    }


    /**
     * Retrieves a summary of the .
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

        int openHazards = hazardRepository.countByActionCompleteIsNullAndDraftFalse();

        // Pending signatures will stay as a placeholder until the schema supports
        // whether a hazard/document requires a signature
        int pendingSignatures = 0;

        return new AdminDashboardSummaryResponse(
                pendingSignatures,
                lateThisWeek,
                openHazards
        );
    }
}
