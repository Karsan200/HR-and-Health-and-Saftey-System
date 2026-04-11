package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response model for BLE signature retrieval.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BleSignatureResponse {
    /** The signature of the BLE device. */
    private UUID signature;
}
