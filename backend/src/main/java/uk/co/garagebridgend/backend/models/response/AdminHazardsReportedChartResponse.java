package uk.co.garagebridgend.backend.models.response;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * Response model representing hazards reported chart data for the admin dashboard.
 */
@Data
@AllArgsConstructor
public class AdminHazardsReportedChartResponse {

    /** Selected time range. */
    private String range;

    /** Total number of hazards reported in the selected range. */
    private int total;

    /** Data points for the chart. */
    private List<AdminDashboardChartPointResponse> points;
}
