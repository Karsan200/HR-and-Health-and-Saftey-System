package uk.co.garagebridgend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.co.garagebridgend.backend.models.entity.IotDeviceTable;

import java.util.UUID;

/**
 * Repository interface for managing IoT device entities in the database.
 * This interface extends JpaRepository to provide CRUD operations for IotDeviceTable entities.
 */
@Repository
public interface IotDeviceRepository extends JpaRepository<IotDeviceTable, UUID> {
}
