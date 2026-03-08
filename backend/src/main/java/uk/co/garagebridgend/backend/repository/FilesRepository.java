package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.FilesTable;

@Repository
public interface FilesRepository extends JpaRepository<FilesTable, Long> {

}
