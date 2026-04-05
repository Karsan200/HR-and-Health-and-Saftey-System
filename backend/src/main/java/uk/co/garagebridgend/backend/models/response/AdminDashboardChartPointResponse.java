package uk.co.garagebridgend.backend.models.response;


import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * A single point of chart data for the admin dashboard.
 */
@Data
@AllArgsConstructor
public class AdminDashboardChartPointResponse {

    /** Label for the chart point, e.g. Mon, Week 1, Jan. */
    private String label;

    /** Value for the chart point. */
    private int value;
}
