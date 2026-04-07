package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * The data transfer object representing a summary of key metrics for the admin dashboard to provide an overview.
 */
@Data
@AllArgsConstructor
public class AdminDashboardSummaryResponse {
    /** Number of pending signatures for documents and hazards. */
    private long pendingSignatures;

    /** Number of occasions an employee has been late to work this week. */
    private int lateThisWeek;

    /** Number of unresolved hazards. */
    private int openHazards;

}
