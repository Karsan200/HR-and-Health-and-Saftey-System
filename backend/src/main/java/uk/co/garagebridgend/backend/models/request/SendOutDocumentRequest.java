package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object used to represent a send out document request.
 * This DTO is used by the backend to receive document data from the
 * frontend React Native application when sending out a new document to employees.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendOutDocumentRequest {

    /** Display title of the document. Any trailing ".pdf" will be stripped by the service. */
    private String title;

    /** Category of the document (e.g., "Policy", "SOP"). */
    private String category;

    /** Whether employees must sign the document after reading it. */
    private boolean requireSignature;

    /**
     * Base64-encoded content of the PDF file (no data-URI prefix, i.e. no
     * {@code data:application/pdf;base64,} header).
     */
    private String content;
}