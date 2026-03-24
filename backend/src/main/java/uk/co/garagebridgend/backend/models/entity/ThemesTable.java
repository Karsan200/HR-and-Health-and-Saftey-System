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

/**
 * Entity representing the theme preferences for a user's account. Each account
 * has a one-to-one relationship with a ThemesTable entry, which stores the
 * background, midground, text, and accent colours for the app's UI.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ThemesTable {
    /** Length of the refresh token pin code. */
    private static final int COLOUR_CODE_LENGTH = 7;

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

    /** Preset Theme of the app. */
    @Column(columnDefinition = "TEXT", name = "theme", nullable = false)
    private String themePreset;

    /** Background colour of the app. */
    @Column(name = "background", length = COLOUR_CODE_LENGTH, nullable = false)
    private String backgroundColour;

    /** Text colour of the app. */
    @Column(name = "text", length = COLOUR_CODE_LENGTH, nullable = false)
    private String textColour;

    /** Accent colour of the app. */
    @Column(name = "accent", length = COLOUR_CODE_LENGTH, nullable = false)
    private String accentColour;
}
