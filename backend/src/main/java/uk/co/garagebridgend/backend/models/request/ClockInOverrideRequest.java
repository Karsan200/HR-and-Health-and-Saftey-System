package uk.co.garagebridgend.backend.models.request;

import java.time.LocalTime;

/**
 * Request body for an admin override of a clock-in record.
 * Either time field may be null to clear that value.
 *
 * @param clockInTime  the new clock-in time, or null to clear it
 * @param clockOutTime the new clock-out time, or null to clear it
 */
public record ClockInOverrideRequest(
        LocalTime clockInTime,
        LocalTime clockOutTime
) {}
