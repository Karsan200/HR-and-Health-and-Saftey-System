package uk.co.garagebridgend.backend.models.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response returned by the today's clock-ins endpoint.
 */
public record TodaysClockInsResponse(

        /** The account ID of the employee. */
        Long accountId,

        /** The employee's full name ({@code firstName + " " + lastName}). */
        String employeeName,

        /**
         * The earliest clock-in event recorded for this employee today,
         * representing when they first arrived on site. Null if no events exist
         * (should not occur in practice since the group only appears when at
         * least one event exists).
         */
        ClockInEventSummary firstOnSite,

        /**
         * The most recent clock-in event recorded for this employee today,
         * representing the last time they were seen on site. Null when the
         * employee has only one event (firstOnSite == lastOnSite).
         */
        ClockInEventSummary lastOnSite,

        /**
         * All clock-in events for this employee today, ordered by creation
         * time ascending. Shown when the admin expands an employee's row.
         */
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
    ) {}
}