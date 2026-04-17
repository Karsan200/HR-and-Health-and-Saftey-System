package uk.co.garagebridgend.backend.models.request;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for an admin manually creating a clock-in record for an employee.
 *
 * @param accountId    the ID of the employee account to create the record for
 * @param date         the date the clock-in belongs to
 * @param clockInTime  the clock-in time, or null if not yet known
 * @param clockOutTime the clock-out time, or null if not yet known
 */
public record ClockInCreateRequest(
        Long accountId,
        LocalDate date,
        LocalTime clockInTime,
        LocalTime clockOutTime
) { }
