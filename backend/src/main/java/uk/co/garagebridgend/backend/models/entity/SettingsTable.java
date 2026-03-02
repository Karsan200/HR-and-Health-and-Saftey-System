package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.MapsId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;

/**
 * Entity representing user settings, including accessibility preferences and
 * notification silencing times. Each user has a one-to-one relationship with
 * their settings, identified by the account ID.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettingsTable {
    /**
     * Account that owns these permissions (primary key).
     * Maps to {@code account_id}.
     */
    @Id
    @Column(name = "account_id")
    private Long accountId;

    /** Account that owns these permissions (primary key). */
    @MapsId
    @OneToOne
    @JoinColumn(name = "account_id")
    private AccountTable account;

    /** Large text field for user defined accessibility settings. */
    @Column(name = "large_text", nullable = false)
    private String largeText;

    /** Dyslexic font for user defined accessibility settings. */
    @Column(name = "dyslexic_font", nullable = false)
    private boolean dyslexicFont;

    /** Text to speech for user defined accessibility settings. */
    @Column(name = "text_to_speech", nullable = false)
    private boolean textToSpeech;

    /** Dictation for user defined accessibility settings. */
    @Column(name = "dictation", nullable = false)
    private boolean dictation;

    /** slient start - when notifications should be silenced. */
    @Column(name = "silent_start")
    private Time silentStart;

    /** slient end - when notifications should be silenced until. */
    @Column(name = "silent_end")
    private Time silentEnd;
}
