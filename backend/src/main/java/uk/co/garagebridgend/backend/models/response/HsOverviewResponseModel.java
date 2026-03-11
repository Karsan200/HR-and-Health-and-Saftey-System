package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object used to represent the overview of health and safety documents.
 * This DTO contains the number of pending documents, signed documents, and hazards.
 * It is used by the backend to send an overview of health and safety data to the frontend React Native application.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HsOverviewResponseModel {
    /** Number of pending health and safety documents. */
    private int pendingDocs;

    /** Number of signed health and safety documents. */
    private int signed;

    /** Number of hazards associated with the account. */
    private int hazards;
}
