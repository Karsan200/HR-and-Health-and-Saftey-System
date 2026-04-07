package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.entity.AccountTable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for accessing clock-in records.
 */
public interface ClockInRepository extends JpaRepository<ClockInTable, UUID> {

    /**
     * Finds all clock-in records for a given account, ordered by creation time descending.
     * @param account the account to find records for
     * @return list of clock-in records
     */
    List<ClockInTable> findByAccountOrderByCreatedDesc(AccountTable account);

    /**
     * Finds all clock-in records for a given account within a date range.
     * @param account the account to find records for
     * @param from the start of the date range (inclusive)
     * @param to the end of the date range (inclusive)
     * @return list of clock-in records within the range
     */
    List<ClockInTable> findByAccountAndCreatedBetweenOrderByCreatedDesc(
            AccountTable account,
            LocalDateTime from,
            LocalDateTime to
    );

    /**
     * Finds the most recent clock-in record for a given account.
     * @param account the account to find the most recent record for
     * @return an optional containing the most recent record, or empty if none exists
     */
    Optional<ClockInTable> findFirstByAccountOrderByCreatedDesc(AccountTable account);
}
