package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.LeaveTable;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface LeaveRepository extends JpaRepository<LeaveTable, Long> {

    @Query("""
        SELECT l FROM LeaveTable l
        WHERE :date >= l.startDate AND :date <= l.endDate
        AND l.isApproved = true
    """)
    List<LeaveTable> findLeaveForDate(LocalDateTime date);

}