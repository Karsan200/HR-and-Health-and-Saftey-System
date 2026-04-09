package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.RiskAssessmentService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.HazardReportResponse;
import uk.co.garagebridgend.backend.models.response.HazardResponse;
import uk.co.garagebridgend.backend.models.response.RiskAssessmentResponse;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * REST controller for viewing risk assessments and their associated hazard reports.
 */
@RestController
@RequestMapping("/api/risk-assessment")
@RequiredArgsConstructor
public class RiskAssessmentController {

    private final RiskAssessmentService riskAssessmentService;

    /**
     * Returns a summary list of all risk assessments.
     *
     * @return list of risk assessment summaries including name, hazard count, and created timestamp
     */
    @GetMapping("/all")
    public List<RiskAssessmentResponse> getAllRiskAssessments() {
        try {
            return riskAssessmentService.getAllRiskAssessments();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve risk assessments");
        }
    }

    /**
     * Returns a list of hazard summaries for a specific risk assessment.
     *
     * @param id the ID of the risk assessment
     * @return list of hazard summaries
     */
    @GetMapping("/{id}/hazards")
    public List<HazardResponse> getHazardsForRiskAssessment(@PathVariable final Long id) {
        try {
            return riskAssessmentService.getHazardsForRiskAssessment(id);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve hazards");
        }
    }

    /**
     * Returns the full detail of a single hazard report.
     *
     * @param id the ID of the hazard
     * @return the full hazard report
     */
    @GetMapping("/hazard/{id}")
    public HazardReportResponse getHazardById(@PathVariable final Long id) {
        try {
            return riskAssessmentService.getHazardById(id);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve hazard");
        }
    }

    @GetMapping("/hazards/drafts")
    public List<HazardResponse> getMyDraftHazards() {
        return riskAssessmentService.getMyDraftHazards();
    }

    @PatchMapping("/hazard/{id}/complete")
    public ResponseEntity<Void> markActionComplete(@PathVariable final Long id) {
        try {
            riskAssessmentService.markActionComplete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to mark action complete");
        }
    }
}