package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.RiskAssessmentTable;

/**
 * Repository for managing RiskAssessmentTable entities.
 */
@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessmentTable, Long> {
}
