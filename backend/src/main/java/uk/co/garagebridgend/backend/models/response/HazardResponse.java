package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO representing a summary of a hazard report
 * within a risk assessment, used for list views.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HazardResponse {
    /** The ID of the hazard. */
    private Long hazardId;

    /** The title of the hazard report. */
    private String title;

    /** The full name of the account that created the hazard. */
    private String createdBy;

    /** Whether the hazard is saved as a draft. */
    private boolean isDraft;

    /** Whether the hazard action has been completed (closed). */
    private boolean isClosed;

    /** The creation timestamp of the hazard. */
    private LocalDateTime created;
}