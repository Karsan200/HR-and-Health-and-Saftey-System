package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.RiskAssessmentHazardId;
import uk.co.garagebridgend.backend.models.entity.RiskAssessmentHazardTable;
import uk.co.garagebridgend.backend.models.entity.RiskAssessmentTable;

import java.util.List;

/**
 * Repository for managing RiskAssessmentHazardTable entities.
 */
@Repository
public interface RiskAssessmentHazardRepository
        extends JpaRepository<RiskAssessmentHazardTable, RiskAssessmentHazardId> {

    /**
     * Counts the number of hazards linked to a given risk assessment.
     *
     * @param riskAssessment the risk assessment to count hazards for
     * @return the number of linked hazards
     */
    int countByRiskAssessment(RiskAssessmentTable riskAssessment);

    /**
     * Finds all hazard join records for a given risk assessment.
     *
     * @param riskAssessment the risk assessment to fetch hazards for
     * @return list of join table entries
     */
    List<RiskAssessmentHazardTable> findByRiskAssessment(RiskAssessmentTable riskAssessment);
}