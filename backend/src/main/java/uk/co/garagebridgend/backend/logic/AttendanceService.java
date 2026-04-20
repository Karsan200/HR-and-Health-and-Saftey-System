package uk.co.garagebridgend.backend.logic;

import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.response.BleSignatureResponse;

/**
 * Service responsible for handling business logic related to attendance and BLE signature retrieval.
 */
@Service
public class AttendanceService {
    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /**
     * Constructs the AttendanceService with the required dependencies.
     *
     * @param authenticationServiceImpl service for handling authentication and retrieving the current user
     */
    public AttendanceService(final AuthenticationService authenticationServiceImpl) {
        this.authenticationService = authenticationServiceImpl;
    }

    /**
     * Retrieves the BLE signature for the currently authenticated user.
     * @return BleSignatureResponse containing the user's BLE signature
     */
    public BleSignatureResponse getBleSignature() {
        // Get the current authenticated user
        var account = authenticationService.getCurrentUser();

        // Return the BLE signature response with the user's account ID
        return new BleSignatureResponse(account.getBleSignature());
    }
}
