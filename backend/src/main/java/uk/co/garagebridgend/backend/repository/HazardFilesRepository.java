package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.HazardFilesTable;
import uk.co.garagebridgend.backend.models.entity.HazardTable;

import java.util.List;
import java.util.UUID;

@Repository
public interface HazardFilesRepository extends JpaRepository<HazardFilesTable, UUID> {
    /**
     * Finds all file associations for a given hazard.
     *
     * @param hazard the hazard to find files for
     * @return list of hazard file associations
     */
    List<HazardFilesTable> findByHazard(HazardTable hazard);
}
