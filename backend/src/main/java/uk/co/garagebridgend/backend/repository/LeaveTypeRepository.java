package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.LeaveTypeTable;

/**
 * Repository interface for accessing leave type records.
 */
@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveTypeTable, Integer> {
}
