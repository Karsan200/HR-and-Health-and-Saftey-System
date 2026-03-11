package uk.co.garagebridgend.backend.models.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Data Transfer Object used to represent leave entries on the calendar.
 * This DTO contains the start and end date of a leave request and is used
 * by the backend to send calendar data to the frontend React Native application.
 */
@Data
@AllArgsConstructor
public class LeaveCalendarResponse {

    /**
     * The start date and time of the leave period.
     */
    private LocalDateTime startDate;

    /**
     * The end date and time of the leave period.
     */
    private LocalDateTime endDate;

}
