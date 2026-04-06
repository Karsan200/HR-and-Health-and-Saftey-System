package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO containing the full detail of a hazard report,
 * used for the hazard view page.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HazardReportResponse {
    /** The ID of the hazard. */
    private Long hazardId;

    /** The title of the hazard report. */
    private String title;

    /** Q1: What are the hazards? */
    private String questionOne;

    /** Q2: Who might be harmed and how? */
    private String questionTwo;

    /** Q3: What are you doing to control the risk? */
    private String questionThree;

    /** Q4: What further actions are needed? */
    private String questionFour;

    /** Q5: Who needs to carry out the action? */
    private String questionFive;

    /** Q6: When is the action needed by? */
    private LocalDateTime questionSix;

    /** Whether the hazard is a draft. */
    private boolean isDraft;

    /** Whether the action has been completed (closed). */
    private boolean isClosed;

    /** The full name of the account that created the hazard. */
    private String createdBy;

    /** The creation timestamp of the hazard. */
    private LocalDateTime created;

    /** URLs of any files attached to this hazard. */
    private List<String> fileUrls;
}