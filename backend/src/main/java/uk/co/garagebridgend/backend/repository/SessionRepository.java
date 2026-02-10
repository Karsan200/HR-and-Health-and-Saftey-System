package uk.co.garagebridgend.backend.repository;

import uk.co.garagebridgend.backend.models.entity.SessionTable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for session entities used to store refresh tokens and
 * session state.
 */
@Repository
public interface SessionRepository extends JpaRepository<SessionTable, UUID> {

}
