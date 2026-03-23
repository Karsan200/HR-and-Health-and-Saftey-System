package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.PayslipsTable;

import java.util.List;
import java.util.UUID;

/**
 * Repository for managing PayslipsTable entities.
 */
@Repository
public interface PayslipRepository extends JpaRepository<PayslipsTable, UUID> {

    /**
     * Finds all payslips belonging to the given account,
     * ordered by year descending then month descending
     * so the most recent appears first.
     *
     * @param account the account to find payslips for
     * @return list of payslips for the account
     */
    List<PayslipsTable> findByFileAccountOrderByYearDescMonthDesc(AccountTable account);
}