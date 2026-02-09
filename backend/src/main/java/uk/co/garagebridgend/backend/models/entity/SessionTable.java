package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a user authentication session.
 *
 * Stores the session UUID, linked account, refresh token
 * and flags for two-factor authentication and expiry.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SessionTable {

    /**
     * Session identifier (generated UUID).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id")
    private UUID sessionId;

    /**
     * Account that owns this session. References {@code account_id} in the
     * account table.
     */
    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "account_id")
    private AccountTable account;

    /** Refresh token associated with the session (sensitive). */
    @Column(name = "refresh_token", nullable = false)
    private String refreshToken;

    /** True when two-factor authentication has been completed for this session. */
    @Column(name = "is_two_factor", nullable = false)
    private boolean isTwoFactor;

    /** When this session (or its refresh token) expires. */
    @Column(name = "expires", nullable = false)
    private LocalDateTime expires;

    /** Creation timestamp (auto-populated, not updatable). */
    @Column(name = "created", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime created;
}
