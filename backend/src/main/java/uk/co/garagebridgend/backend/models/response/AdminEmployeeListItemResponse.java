package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Represents a single employee in the admin employee overview list.
 */
@Data
@AllArgsConstructor
public class AdminEmployeeListItemResponse {

    /** Employee account id. */
    private Long accountId;

    /** Employee full name. */
    private String fullName;

    /** Employee position label for display. */
    private String position;
}
