package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response model representing a qualification
 * returned to the frontend.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QualificationResponse {

    /** Title of the qualification. */
    private String title;

    /** Details describing the qualification. */
    private String details;

    /** Pre-signed URL for the qualification PDF. */
    private String url;
}