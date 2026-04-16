package uk.co.garagebridgend.backend.repository;

import uk.co.garagebridgend.backend.models.entity.AccountTable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    /**
     * Finds an account using its associated Bluetooth signature.
     *
     * @param bleSignature the Bluetooth signature to search for
     * @return an Optional containing the found account, or empty if not found
     */
    Optional<AccountTable> findByBleSignature(UUID bleSignature);

    /**
     * Retrieves all accounts ordered by first name and last name.
     *
     * @return all accounts ordered alphabetically
     */
    List<AccountTable> findAllByOrderByFirstNameAscLastNameAsc();

    /**
     * Searches accounts by first name, last name, full name, email, or username.
     *
     * @param search the search text
     * @return matching accounts ordered alphabetically
     */
    @Query("""
        SELECT a
        FROM AccountTable a
        WHERE LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(CONCAT(a.firstName, ' ', a.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(a.username) LIKE LOWER(CONCAT('%', :search, '%'))
        ORDER BY a.firstName ASC, a.lastName ASC
    """)
    List<AccountTable> searchForEmployeeOverview(@Param("search") String search);

    /**
     * Searches for accounts whose first name or last name contains the given
     * query string (case-insensitive). Returns up to 10 results ordered
     * alphabetically by last name then first name. Used by the admin clock-in
     * page autocomplete to look up employees by name.
     *
     * @param query the partial name to search for
     * @return a list of matching accounts, limited to 10 results
     */
    @Query("""
        SELECT a FROM AccountTable a
        WHERE LOWER(a.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(a.lastName)  LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(CONCAT(a.firstName, ' ', a.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY a.lastName ASC, a.firstName ASC
        LIMIT 10
    """)
    List<AccountTable> searchByName(@Param("query") String query);
}
