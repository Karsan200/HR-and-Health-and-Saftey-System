package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.HazardFilesTable;

import java.util.UUID;

@Repository
public interface HazardFilesRepository extends JpaRepository<HazardFilesTable, UUID> {
}
