package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object used to represent a file upload request.
 * This DTO contains the name, extension, and content type of the file being uploaded.
 * It is used by the backend to receive file metadata from the frontend React Native application.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadRequest {
    /** Name of the file being uploaded. */
    private String name;

    /** Extension of the file being uploaded (e.g., "pdf", "jpg"). */
    private String extension;

    /** The actual file being uploaded. */
    private String content;
}
