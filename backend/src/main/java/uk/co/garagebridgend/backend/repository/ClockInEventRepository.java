package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ClockInEventTable;

import java.util.UUID;

/**
 * Repository for managing ClockInEventTable entities.
 */
@Repository
public interface ClockInEventRepository extends JpaRepository<ClockInEventTable, UUID> {
}
