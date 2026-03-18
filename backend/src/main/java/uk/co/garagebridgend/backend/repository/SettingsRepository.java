package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.SettingsTable;

import java.util.Optional;

/**
 * Repository interface which accesses users' settings from the database.
 */
@Repository
public interface SettingsRepository extends JpaRepository<SettingsTable, Long> {
    /**
     * Finds an account settings by its account ID.
     *
     * @param accountId the ID of the user to search for
     * @return an Optional containing the found settings, or empty if not found
     */
    Optional<SettingsTable> findByAccountId(Long accountId);
}
