package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.ThemesTable;

import java.util.Optional;

/**
 * Repository interface which accesses users' theme from the database.
 */
@Repository
public interface ThemeRepository extends JpaRepository<ThemesTable, Long> {
    /**
     * Finds an account theme by its account ID.
     *
     * @param accountId the ID of the user to search for
     * @return an Optional containing the found theme colours and name, or empty if not found
     */
    Optional<ThemesTable> findByAccountId(Long accountId);
}
