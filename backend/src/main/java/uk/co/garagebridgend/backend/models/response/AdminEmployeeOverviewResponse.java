package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the employee detail data shown in the admin employee overview page.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminEmployeeOverviewResponse {

    /** Employee account id. */
    private Long accountId;

    /** Employee full name. */
    private String fullName;

    /** Employee position label for display. */
    private String position;

    /** Employee email address. */
    private String email;

    /** Total number of hours worked in the current month. */
    private double hoursWorkedThisMonth;

    /** Number of late clock-ins in the current month. */
    private int latesThisMonth;

    /** Next upcoming approved leave, if one exists. */
    private AdminEmployeeUpcomingLeaveResponse upcomingLeave;
}
