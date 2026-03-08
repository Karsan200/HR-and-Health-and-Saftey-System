package uk.co.garagebridgend.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveTable, Long> {

}