package uk.co.garagebridgend.backend.logic;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.ClockInEventTable;
import uk.co.garagebridgend.backend.models.exception.UnauthorisedIotDeviceException;
import uk.co.garagebridgend.backend.models.request.IotAttendanceUploadRequest;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInEventRepository;
import uk.co.garagebridgend.backend.repository.IotDeviceRepository;

import java.util.UUID;

@Service
public class IotService {
    /** Repository for managing IoT devices. */
    private final IotDeviceRepository iotDeviceRepository;

    /** Repository for managing accounts. */
    private final AccountRepository accountRepository;

    /** Repository for managing clock-in events. */
    private final ClockInEventRepository clockInEventRepository;

    /** Constructs an IotService with the specified repositories.
     *
     * @param iotDeviceRepositoryImpl the repository for managing IoT devices
     * @param accountRepositoryImpl the repository for managing accounts
     * @param clockInEventRepositoryImpl the repository for managing clock-in events
     */
    public IotService(
            final IotDeviceRepository iotDeviceRepositoryImpl,
            final AccountRepository accountRepositoryImpl,
            final ClockInEventRepository clockInEventRepositoryImpl
    ) {
        this.iotDeviceRepository = iotDeviceRepositoryImpl;
        this.accountRepository = accountRepositoryImpl;
        this.clockInEventRepository = clockInEventRepositoryImpl;
    }

    /** Authorises an IoT device by validating its ID and access token.
     *
     * @param deviceId the unique identifier of the IoT device
     * @param deviceToken the access token provided by the IoT device
     * @throws UnauthorisedIotDeviceException if the device is not found or the token is invalid
     */
    public void authorise(final UUID deviceId, final String deviceToken) throws UnauthorisedIotDeviceException {
        // Find the device by ID and check if the token matches
        var device = iotDeviceRepository.findById(deviceId)
                .orElseThrow(UnauthorisedIotDeviceException::new);

        // Validate the access token
        if (!BCrypt.checkpw(deviceToken, device.getAccessToken())) {
            throw new UnauthorisedIotDeviceException();
        }
    }

    public void registerAttendance(final IotAttendanceUploadRequest body) {
        // Iterate through the attendance records in the request body and process them
        for (var record : body.getSignatures()) {
            // Find the account associated with the BLE signature
            var account = accountRepository.findByBleSignature(record)
                    .orElse(null);

            if (account != null) {
                // Create a new clock-in event
                var clockIn = new ClockInEventTable();
                clockIn.setAccount(account);
                clockIn.setCreated(body.getTimestamp());

                // Save the clock-in event to the database
                clockInEventRepository.save(clockIn);
            }
        }
    }
}
