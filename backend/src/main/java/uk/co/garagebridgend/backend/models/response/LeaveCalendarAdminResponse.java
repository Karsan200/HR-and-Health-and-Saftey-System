package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Response model representing a single leave entry for display on the calendar.
 * One instance is returned per leave record, covering every calendar date
 * within that leave's date range.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveCalendarAdminResponse {

    /** ISO date string for the calendar day this entry belongs to (YYYY-MM-DD). */
    private LocalDate date;

    /** Full name of the employee on leave. */
    private String employeeName;

    /**
     * Leave type identifier matching the frontend CalendarEventType.
     * One of: nationalHoliday, sickLeave, bookedLeave, trainingLeave.
     */
    private String leaveType;

    /** Optional notes left on the leave request. */
    private String notes;

    /**
     * Clock-in time for partial-day leave. Only populated when the leave
     * spans a single day; null for multi-day bookings.
     */
    private LocalTime startTime;

    /**
     * Clock-out time for partial-day leave. Only populated when the leave
     * spans a single day; null for multi-day bookings.
     */
    private LocalTime endTime;
}
