package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Response model for yesterday's clock-in activity and running stats.
 */
@Data
@AllArgsConstructor
public class ClockInStatusResponse {

    /**
     * The clock-in time for yesterday in HH:mm format, or null if no record exists.
     */
    private String yesterdayClockIn;

    /**
     * The clock-out time for yesterday in HH:mm format, or null if no record exists.
     */
    private String yesterdayClockOut;

    /**
     * The date label for yesterday (e.g. "Monday, 6 April, 2026").
     */
    private String yesterdayDate;

    /**
     * Total number of late clock-ins recorded for the current month.
     */
    private int totalLates;

    /**
     * Percentage of days the employee clocked in on time, for the current month.
     */
    private double onTimePercent;

    /**
     * Average hours worked per day for the current month.
     */
    private double avgHoursPerDay;

    /**
     * Total number of days worked in the current month.
     */
    private int daysWorked;

    /** Today's earliest clock-in time formatted as HH:mm, or null if not yet clocked in. */
    private String todayClockIn;
}
