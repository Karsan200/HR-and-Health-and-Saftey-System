package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

import java.util.Optional;

@Repository
public interface PermissionsRepository extends JpaRepository<PermissionsTable, AccountTable> {
    Optional<PermissionsTable> findByUsername(String username);
}
