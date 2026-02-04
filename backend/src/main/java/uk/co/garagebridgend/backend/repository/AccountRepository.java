package uk.co.garagebridgend.backend.repository;

import uk.co.garagebridgend.backend.models.entity.AccountTable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<AccountTable, Long> {

}
