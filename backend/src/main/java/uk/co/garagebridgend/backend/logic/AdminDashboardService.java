package uk.co.garagebridgend.backend.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.response.AdminDashboardSummaryResponse;
import uk.co.garagebridgend.backend.repository.ClockInRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

import java.sql.Time;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    /** Repository to access account data. */
    private final AccountRepository accountRepository;

    /** Repository to access document data. */
    private final DocumentRepository documentRepository;

    /** Repository to access signature data. */
    private final SignatureRepository signatureRepository;

    /**
     * Constructs the HsOverviewService with the required repositories.
     *
     * @param hazardRepositoryImpl    repository for HazardTable
     * @param clockInRepositoryImpl  repository for ClockInTable
     * @param accountRepositoryImpl  repository for AccountTable
     * @param documentRepositoryImpl repository for DocumentTable
     * @param signatureRepositoryImpl repository for SignatureTable
     */
    @Autowired
    public AdminDashboardService(
            final ClockInRepository clockInRepositoryImpl,
            final HazardRepository hazardRepositoryImpl,
            final AccountRepository accountRepositoryImpl,
            final DocumentRepository documentRepositoryImpl,
            final SignatureRepository signatureRepositoryImpl
            ) {
        this.hazardRepository = hazardRepositoryImpl;
        this.clockInRepository = clockInRepositoryImpl;
        this.accountRepository = accountRepositoryImpl;
        this.documentRepository = documentRepositoryImpl;
        this.signatureRepository = signatureRepositoryImpl;
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
}
