package uk.co.garagebridgend.backend.models.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response model representing a single payslip entry
 * returned to the frontend.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayslipResponse {

    /** The display name of the payslip file. */
    private String name;

    /** The year this payslip is for. */
    private Integer year;

    /** The month this payslip is for. */
    private Integer month;

    /** Whether this is a P60 document. */
    @JsonProperty("isPSixty")
    private boolean isPSixty;

    /** Pre-signed URL to access the PDF in cloud storage. */
    private String url;
}
