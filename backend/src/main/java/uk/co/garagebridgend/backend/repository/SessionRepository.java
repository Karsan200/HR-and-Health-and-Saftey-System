package uk.co.garagebridgend.backend.repository;

import uk.co.garagebridgend.backend.models.entity.SessionTable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<SessionTable, UUID> {

}
