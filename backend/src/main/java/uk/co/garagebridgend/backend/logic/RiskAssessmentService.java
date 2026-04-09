package uk.co.garagebridgend.backend.logic;

import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.entity.RiskAssessmentHazardTable;
import uk.co.garagebridgend.backend.models.response.HazardReportResponse;
import uk.co.garagebridgend.backend.models.response.HazardResponse;
import uk.co.garagebridgend.backend.models.response.RiskAssessmentResponse;
import uk.co.garagebridgend.backend.repository.HazardFilesRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;
import uk.co.garagebridgend.backend.repository.RiskAssessmentHazardRepository;
import uk.co.garagebridgend.backend.repository.RiskAssessmentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * Service class for risk assessment and hazard viewing operations.
 */
@Service
public class RiskAssessmentService {

    private final RiskAssessmentRepository riskAssessmentRepository;
    private final RiskAssessmentHazardRepository riskAssessmentHazardRepository;
    private final HazardRepository hazardRepository;
    private final HazardFilesRepository hazardFilesRepository;
    private final StorageService storageService;
    private final AuthenticationService authenticationService;

    public RiskAssessmentService(
            final RiskAssessmentRepository riskAssessmentRepository,
            final RiskAssessmentHazardRepository riskAssessmentHazardRepository,
            final HazardRepository hazardRepository,
            final HazardFilesRepository hazardFilesRepository,
            final StorageService storageService,
            final AuthenticationService authenticationService) {
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.riskAssessmentHazardRepository = riskAssessmentHazardRepository;
        this.hazardRepository = hazardRepository;
        this.hazardFilesRepository = hazardFilesRepository;
        this.storageService = storageService;
        this.authenticationService = authenticationService;
    }

    /**
     * Returns a summary list of all risk assessments, each with their hazard count.
     *
     * @return list of risk assessment summaries
     */
    public List<RiskAssessmentResponse> getAllRiskAssessments() {

        var currentUser = authenticationService.getCurrentUser();

        return riskAssessmentRepository.findAll().stream()
                .map(ra -> {
                    List<RiskAssessmentHazardTable> joins =
                            riskAssessmentHazardRepository.findByRiskAssessment(ra);

                    boolean hasDrafts = joins.stream()
                            .anyMatch(j ->
                                    j.getHazard().isDraft() &&
                                            j.getHazard().getAccount().getAccountId()
                                                    .equals(currentUser.getAccountId())
                            );

                    return new RiskAssessmentResponse(
                            ra.getRiskAssessmentId(),
                            ra.getTitle(),
                            joins.size(),
                            ra.getCreated(),
                            hasDrafts
                    );
                })
                .collect(Collectors.toList());
    }
    /**
     * Returns a list of hazard summaries linked to a given risk assessment.
     *
     * @param riskAssessmentId the ID of the risk assessment
     * @return list of hazard summaries
     * @throws NoSuchElementException if the risk assessment does not exist
     */
    public List<HazardResponse> getHazardsForRiskAssessment(final Long riskAssessmentId) {
        var riskAssessment = riskAssessmentRepository.findById(riskAssessmentId)
                .orElseThrow(() -> new NoSuchElementException("Risk assessment not found"));

        var currentUser = authenticationService.getCurrentUser();

        return riskAssessmentHazardRepository.findByRiskAssessment(riskAssessment).stream()
                .map(RiskAssessmentHazardTable::getHazard)

                .filter(hazard -> {
                    var account = hazard.getAccount();
                    boolean isOwned = account.getAccountId().equals(currentUser.getAccountId());

                    if (hazard.isDraft() && !isOwned) {
                        return false; // hide drafts from other users
                    }

                    return true;
                })

                .map(hazard -> {
                    var account = hazard.getAccount();
                    String createdBy = account.getFirstName() + " " + account.getLastName();
                    boolean isClosed = hazard.getActionComplete() != null;
                    boolean isOwned = account.getAccountId().equals(currentUser.getAccountId());

                    return new HazardResponse(
                            hazard.getHazardId(),
                            hazard.getTitle(),
                            createdBy,
                            hazard.isDraft(),
                            isClosed,
                            hazard.getCreated(),
                            isOwned
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns the full detail of a single hazard report.
     *
     * @param hazardId the ID of the hazard
     * @return the full hazard report response
     * @throws NoSuchElementException if the hazard does not exist
     */
    public HazardReportResponse getHazardById(final Long hazardId) {
        var hazard = hazardRepository.findById(hazardId)
                .orElseThrow(() -> new NoSuchElementException("Hazard not found"));

        var account = hazard.getAccount();
        String createdBy = account.getFirstName() + " " + account.getLastName();
        boolean isClosed = hazard.getActionComplete() != null;

        // Fetch file URLs from object storage
        List<String> fileUrls = hazardFilesRepository.findByHazard(hazard).stream()
                .map(hf -> storageService.getPresignedUrl(hf.getFile().getFileId().toString()))
                .collect(Collectors.toList());

        return new HazardReportResponse(
                hazard.getHazardId(),
                hazard.getTitle(),
                hazard.getQuestionOne(),
                hazard.getQuestionTwo(),
                hazard.getQuestionThree(),
                hazard.getQuestionFour(),
                hazard.getQuestionFive(),
                hazard.getQuestionSix(),
                hazard.isDraft(),
                isClosed,
                createdBy,
                hazard.getCreated(),
                fileUrls
        );
    }

    public List<HazardResponse> getMyDraftHazards() {

        var currentUser = authenticationService.getCurrentUser();

        return hazardRepository.findAll().stream()
                .filter(hazard ->
                        hazard.isDraft() &&
                                hazard.getAccount().getAccountId().equals(currentUser.getAccountId())
                )
                .map(hazard -> {
                    var account = hazard.getAccount();
                    String createdBy = account.getFirstName() + " " + account.getLastName();
                    boolean isClosed = hazard.getActionComplete() != null;

                    return new HazardResponse(
                            hazard.getHazardId(),
                            hazard.getTitle(),
                            createdBy,
                            hazard.isDraft(),
                            isClosed,
                            hazard.getCreated(),
                            true
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Sets the actionComplete timestamp on a hazard to the current date/time,
     * marking the action as completed and closing the hazard.
     *
     * @param hazardId the ID of the hazard to mark complete
     * @throws NoSuchElementException if the hazard does not exist
     */
    public void markActionComplete(final Long hazardId) {
        var hazard = hazardRepository.findById(hazardId)
                .orElseThrow(() -> new NoSuchElementException("Hazard not found"));

        hazard.setActionComplete(LocalDateTime.now());
        hazardRepository.save(hazard);
    }
}