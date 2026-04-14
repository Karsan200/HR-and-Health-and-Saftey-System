package uk.co.garagebridgend.backend.models.request;

import java.time.LocalTime;

/**
 * Request body for an admin override of a clock-in record.
 * Either time field may be null to clear that value.
 * If removeReport is true and a report exists for this record, it will be deleted.
 *
 * @param clockInTime  the new clock-in time, or null to clear it
 * @param clockOutTime the new clock-out time, or null to clear it
 * @param removeReport whether to delete the attached employee report after saving
 */
public record ClockInOverrideRequest(
        LocalTime clockInTime,
        LocalTime clockOutTime,
        boolean removeReport
) {}