package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.SettingsTable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface which accesses users settings from the database.
 */
@Repository
public interface SettingsRepository extends JpaRepository<SettingsTable, Long> {
}
