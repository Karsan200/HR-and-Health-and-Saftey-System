package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents an IoT device registered in the system.
 * <p>
 * Stores the device's unique identifier, access token, scanning and upload
 * intervals, RSSI threshold, last activity timestamp, and creation timestamp.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class IotDeviceTable {
    /**
     * Device identifier (generated UUID).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "device_id")
    private UUID deviceId;

    /** Access token for the device. */
    @Column(columnDefinition = "TEXT", name = "access_token", nullable = false)
    private String accessToken;

    /** Interval (in seconds) for scanning for nearby devices. */
    @Column(columnDefinition = "INT NOT NULL DEFAULT 30", name = "scanning_interval", nullable = false)
    private int scanningInterval;

    /** Interval (in seconds) for uploading data to the server. */
    @Column(columnDefinition = "INT NOT NULL DEFAULT 120", name = "upload_interval", nullable = false)
    private int uploadInterval;

    /** RSSI threshold for determining proximity. */
    @Column(columnDefinition = "INT NOT NULL DEFAULT -75", name = "rssi_threshold", nullable = false)
    private int rssiThreshold;

    /** Timestamp of the last activity from the device. */
    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    /** Creation timestamp (auto-populated, not updatable). */
    @CreationTimestamp
    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime created;
}
