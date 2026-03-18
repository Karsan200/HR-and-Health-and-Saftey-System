package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;

/**
 * Data Transfer Object for the settings - Accessibility, Silent Mode and Themes.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettingsResponse {
    /**
     * Accessibility Settings Booleans
     */
    private boolean largeText;
    private boolean dyslexicFont;
    private boolean textToSpeech;
    private boolean dictation;
    private boolean highlightText;

    /**
     * Silent Mode time - For Admin use only
     */
    private Time silentStart;
    private Time silentEnd;

    /**
     * Colour Settings Hex Codes and Title
     */
    private String themePreset;
    private String accentColour;
    private String backgroundColour;
    private String textColour;
}
