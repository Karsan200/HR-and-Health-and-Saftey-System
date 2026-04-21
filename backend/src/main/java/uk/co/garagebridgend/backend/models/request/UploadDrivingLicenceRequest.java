package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadDrivingLicenceRequest {
    /** The name of the uploaded file. */
    private String title;
    /** The account ID of the employee this licence belongs to. */
    private Long employeeId;
    /** The file type of the document. */
    private String extension;
    /**
     * Base64-encoded content of the PDF file (no data-URI prefix, i.e. no
     * {@code data:application/pdf;base64,} header).
     */
    private String content;
}
