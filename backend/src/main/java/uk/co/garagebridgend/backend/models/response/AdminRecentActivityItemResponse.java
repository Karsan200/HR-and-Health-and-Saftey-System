package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Represents a single item in the admin dashboard recent activity feed.
 */
@Data
@AllArgsConstructor
public class AdminRecentActivityItemResponse {

    /** The type of activity, used by the frontend to select an icon or style. */
    private String type;

    /** Human-readable message describing the activity. */
    private String message;

    /** Timestamp of when the activity occurred. */
    private LocalDateTime created;
}
