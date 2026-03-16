package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object used to represent a hazard report request.
 * This DTO is used by the backend to receive hazard report data from the
 * frontend React Native application.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HazardReportRequest {
    /** The title of the hazard being reported. */
    private String title;

    /** first question of the hazard report. */
    private String questionOne;

    /** second question of the hazard report. */
    private String questionTwo;

    /** third question of the hazard report. */
    private String questionThree;

    /** fourth question of the hazard report. */
    private String questionFour;

    /** fifth question of the hazard report. */
    private String questionFive;

    /** The due date of the hazard. */
    private LocalDateTime questionSix;

    /** Whether the hazard is a draft. */
    private boolean isDraft;

    /** Whether the hazard report has been completed. */
    private boolean isCompleted;

    /** The files uploaded with the hazard report. */
    private List<FileUploadRequest> files;
}
