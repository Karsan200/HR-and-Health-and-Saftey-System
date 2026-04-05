package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

/**
 * Response model representing the late arrivals chart data for the admin dashboard.
 */
@Data
@AllArgsConstructor
public class AdminLateArrivalsChartResponse {

    /** Selected time range. */
    private String range;

    /** Total number of late arrivals in the given range. */
    private int total;

    /** Data points for the chart. */
    private List<AdminDashboardChartPointResponse> points;
}
