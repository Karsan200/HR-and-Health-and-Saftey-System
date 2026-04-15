package uk.co.garagebridgend.backend.models.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UploadPayslipRequest {

    private Long accountId;
    private Integer month;
    private Integer year;
    private boolean isP60;
    private String content;
    private String fileName;
}
