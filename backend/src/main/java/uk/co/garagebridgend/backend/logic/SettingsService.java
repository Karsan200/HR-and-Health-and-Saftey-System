package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.repository.SettingsRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service responsible for handling business logic related to user settings.
 */
@Service
@RequiredArgsConstructor
public class SettingsService {

    /**
     * Repository used to access settings data from the database.
     */
    private final SettingsRepository settingsRepository;
}
