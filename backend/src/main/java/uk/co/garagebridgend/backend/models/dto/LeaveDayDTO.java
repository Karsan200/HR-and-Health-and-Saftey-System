package uk.co.garagebridgend.backend.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LeaveDayDTO {

    private String name;
    private String role;
    private LocalDateTime endDate;

}