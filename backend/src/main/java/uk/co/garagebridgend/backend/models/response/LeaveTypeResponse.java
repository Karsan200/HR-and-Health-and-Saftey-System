package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Data Transfer Object representing a leave type.
 * This is sent to the frontend so it can display
 * available leave categories in the booking modal.
 */
@Data
@AllArgsConstructor
public class LeaveTypeResponse {

    /**
     * Unique identifier for the leave type.
     */
    private Integer leaveTypeId;

    /**
     * Display name of the leave type.
     */
    private String name;

    /**
     * Icon colour for the leave type.
     */
    private String colourIcon;

    /**
     * Background colour for the leave type.
     */
    private String colourBg;

    /**
     * Icon name/type for the leave type.
     */
    private String iconType;
}
