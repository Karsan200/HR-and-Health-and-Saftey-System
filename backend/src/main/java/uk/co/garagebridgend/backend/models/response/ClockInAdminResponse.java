package uk.co.garagebridgend.backend.models.response;

import java.time.LocalTime;
import java.util.UUID;

/**
 * Response object representing a single clock-in record for the admin overrides page.
 * Includes the employee's name, their clock-in and clock-out times, and an optional
 * report if the employee has flagged an issue with this record.
 *
 * @param clockId      the UUID of the clock-in record
 * @param employeeName the full name of the employee
 * @param accountId    the account ID of the employee
 * @param clockInTime  the recorded clock-in time, or null if not set
 * @param clockOutTime the recorded clock-out time, or null if not set
 * @param created      the timestamp when this clock-in record was created
 * @param report       an optional report submitted by the employee, or null if none exists
 */
public record ClockInAdminResponse(
        UUID clockId,
        String employeeName,
        Long accountId,
        LocalTime clockInTime,
        LocalTime clockOutTime,
        java.time.LocalDateTime created,
        boolean isAdminAdjusted,
        ClockInReportSummary report
) {
    /**
     * Represents a summary of a clock-in issue report attached to this record.
     *
     * @param reportId the ID of the report
     * @param issue    the description of the issue submitted by the employee
     * @param created  the timestamp when the report was submitted
     */
    public record ClockInReportSummary(
            Long reportId,
            String issue,
            java.time.LocalDateTime created
    ) { }
}
