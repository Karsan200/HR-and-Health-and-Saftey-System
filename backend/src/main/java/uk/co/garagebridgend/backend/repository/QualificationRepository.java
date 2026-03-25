package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.QualificationsTable;

import java.util.List;

/**
 * Repository for managing qualifications.
 */
@Repository
public interface QualificationRepository extends JpaRepository<QualificationsTable, Long> {

    /**
     * Finds all qualifications belonging to an account.
     *
     * @param account the account
     * @return list of qualifications
     */
    List<QualificationsTable> findByAccountOrderByCreatedDesc(AccountTable account);
}