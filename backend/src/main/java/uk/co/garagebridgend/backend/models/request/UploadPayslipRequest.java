package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadPayslipRequest {
    /** The account ID of the employee this payslip belongs to. */
    private Long accountId;
    /** The month this payslip is for (1-12). */
    private Integer month;
    /** The year this payslip is for (e.g., 2024). */
    private Integer year;
    /** Whether this is a P60 document. */
    private boolean isP60;
    /**
     * Base64-encoded content of the PDF file (no data-URI prefix, i.e. no
     * {@code data:application/pdf;base64,} header).
     */
    private String content;
        /** The display name of the payslip file (e.g., "April 2024 Payslip.pdf"). */
    private String fileName;
}
