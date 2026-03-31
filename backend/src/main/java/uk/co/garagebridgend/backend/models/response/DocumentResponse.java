package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object used to represent a document response.
 * This DTO contains the document ID, title, URL, and signed status of a document.
 * It is used by the backend to send document information to the frontend React Native application.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentResponse {

    /** The unique identifier of the document. */
    private Long documentId;

    /** The display title of the document. */
    private String title;

    /** Pre-signed URL to access the document in cloud storage. */
    private String url;

    /** Whether the document has been signed. */
    private boolean signed;

}
