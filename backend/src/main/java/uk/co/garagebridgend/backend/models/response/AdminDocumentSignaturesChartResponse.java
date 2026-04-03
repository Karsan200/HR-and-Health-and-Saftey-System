package uk.co.garagebridgend.backend.models.response;


import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response model representing document signature totals for the admin dashboard.
 */
@Data
@AllArgsConstructor
public class AdminDocumentSignaturesChartResponse {

    /** Total number of recorded document signatures. */
    private long signed;

    /** Total number of pending document signatures. */
    private long pending;
}
