package uk.co.garagebridgend.backend.models.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Data Transfer Object representing a single day of leave information.
 * This DTO is used to send employee leave data from the backend to the
 * frontend application. It contains the employee's name, their role,
 * and the end date of their leave period.
 */
@Data
@AllArgsConstructor
public class LeaveDayDTO {

    /**
     * The name of the employee on leave.
     */
    private String name;

    /**
     * The role of the employee on leave.
     */
    private String role;

    /**
     * The date and time when the leave period ends.
     */
    private LocalDateTime endDate;

}
