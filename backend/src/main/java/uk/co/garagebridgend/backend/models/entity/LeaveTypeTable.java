package uk.co.garagebridgend.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a type of leave that an employee can take.
 * <p>
 * Stores the unique identifier for the leave type.
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveTypeTable {
    /** Named constant for colour code column length. */
    private static final int COLOUR_CODE_LENGTH = 6;

    /** Primary key (auto-generated). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "TINYINT", name = "leave_type_id")
    private Integer leaveTypeId;

    /** Name of the leave type (e.g., "Sick Leave", "Holiday"). */
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    /** The colour of the icon for the leave type. */
    @Column(name = "colour_icon", length = COLOUR_CODE_LENGTH, nullable = false)
    private String colourIcon;

    /** The colour of the background for the leave type. */
    @Column(name = "colour_bg", length = COLOUR_CODE_LENGTH, nullable = false)
    private String colourBg;

    /** The type of the icon for the leave type. */
    @Column(name = "icon_type", nullable = false)
    private String iconType;
}
