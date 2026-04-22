package uk.co.garagebridgend.backend.models.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response returned by the today's clock-ins endpoint.
 *
 * @param accountId    the account ID of the employee
 * @param employeeName the employee's full name ({@code firstName + " " + lastName})
 * @param firstOnSite  the earliest clock-in event recorded for this employee today
 * @param lastOnSite   the most recent clock-in event recorded for this employee today
 * @param allEvents    all clock-in events for this employee today, ordered by creation
 *                     time ascending; shown when the admin expands an employee's row
 */
public record TodaysClockInsResponse(
        Long accountId,
        String employeeName,
        ClockInEventSummary firstOnSite,
        ClockInEventSummary lastOnSite,
        List<ClockInEventSummary> allEvents
) {

    /**
     * A lightweight summary of a single clock-in event.
     *
     * @param eventId   the UUID of the clock-in event
     * @param timestamp the exact date-time the event was created
     */
    public record ClockInEventSummary(
            UUID eventId,
            LocalDateTime timestamp
    ) { }
}
