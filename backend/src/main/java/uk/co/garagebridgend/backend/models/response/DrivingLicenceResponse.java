package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response model representing the most recent driving licence
 * for the authenticated user.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DrivingLicenceResponse {

    /** The title of the driving licence document. */
    private String title;

    /** The file extension e.g. "pdf", "jpg", "png". */
    private String extension;

    /** Pre-signed URL or base64 data URI to access the file. */
    private String url;
}