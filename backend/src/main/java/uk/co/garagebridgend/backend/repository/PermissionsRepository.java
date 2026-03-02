package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;

/**
 * JPA repository for managing {@link PermissionsTable} entities.
 */
@Repository
public interface PermissionsRepository extends JpaRepository
    <PermissionsTable, Long> {

}
