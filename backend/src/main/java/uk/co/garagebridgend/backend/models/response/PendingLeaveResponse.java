package uk.co.garagebridgend.backend.models.response;

import java.time.LocalDateTime;

/**
 * Response object representing a single pending leave request,
 * returned to the admin pending-requests page.
 *
 * @param leaveId       the unique identifier of the leave record
 * @param employeeName  the full name of the employee who made the request
 * @param leaveType     the human-readable leave type label (e.g. "Holiday", "Sick")
 * @param startDate     the start date and time of the requested leave
 * @param endDate       the end date and time of the requested leave
 * @param notes         optional notes supplied by the employee when booking
 * @param created       the timestamp when the request was created
 */
public record PendingLeaveResponse(
        Long leaveId,
        String employeeName,
        String leaveType,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String notes,
        LocalDateTime created
) { }
