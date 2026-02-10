package uk.co.garagebridgend.backend.repository;

import uk.co.garagebridgend.backend.models.entity.AccountTable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA repository for managing {@link AccountTable} entities.
 */
@Repository
public interface AccountRepository extends JpaRepository<AccountTable, Long> {
    /**
     * Finds an account by its username.
     *
     * @param username the username to search for
     * @return an Optional containing the found account, or empty if not found
     */
    Optional<AccountTable> findByUsername(String username);
}
