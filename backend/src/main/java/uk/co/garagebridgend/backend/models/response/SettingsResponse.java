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
     * Accessibility Settings Large Text.
     */
    private Boolean largeText;
    /**
     * Accessibility Settings Dyslexic Font.
     */
    private Boolean dyslexicFont;
    /**
     * Accessibility Settings Text To Speech.
     */
    private Boolean textToSpeech;
    /**
     * Accessibility Settings Dictation.
     */
    private Boolean dictation;
    /**
     * Accessibility Settings Highlight Text.
     */
    private Boolean highlightText;

    /**
     * Silent Mode time - For Admin use only. Start Time.
     */
    private Time silentStart;
    /**
     * Silent Mode time - For Admin use only. End Time.
     */
    private Time silentEnd;

    /**
     * Colour Settings Theme Title.
     */
    private String themePreset;
    /**
     * Colour Settings Hex Codes of accent colour.
     */
    private String accentColour;
    /**
     * Colour Settings Hex Codes of background colour.
     */
    private String backgroundColour;
    /**
     * Colour Settings Hex Codes of text colour.
     */
    private String textColour;
}
