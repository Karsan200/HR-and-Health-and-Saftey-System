package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import uk.co.garagebridgend.backend.models.entity.SessionTable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for session entities used to store refresh tokens and
 * session state.
 */
@Repository
public interface SessionRepository extends JpaRepository<SessionTable, UUID> {
    /**
     * Finds a session by its refresh token.
     * @param refreshToken the refresh token to search for
     * @return an Optional containing the found session, or empty if not found
     */
    Optional<SessionTable> findByRefreshToken(String refreshToken);

    /**
     * Deletes all mobile sessions for a given account ID.
     * @param accountId the ID of the account whose mobile sessions should be deleted
     */
    @Modifying
    @Query("""
    DELETE FROM SessionTable s
    WHERE s.account.accountId = :accountId
    AND s.isMobile = true
    """)
    void deleteMobileSessionsByAccountId(@Param("accountId") Long accountId);
}
