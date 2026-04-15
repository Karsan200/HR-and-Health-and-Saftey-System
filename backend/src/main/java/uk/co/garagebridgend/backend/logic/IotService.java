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

/**
 * Service class for handling IoT device interactions, including authorisation and attendance registration.
 */
@Service
public class IotService {
    /** The number of days after which clock-in events are considered expired and should be ignored.*/
    private static final int ATTENDANCE_RECORD_EXPIRY_DAYS = 7;

    /** The minimum number of minutes that must elapse between clock-in events for the same account.*/
    private static final int MINUTES_BETWEEN_CLOCK_INS = 1;

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

    /** Registers attendance records from an IoT device upload request.
     *
     * @param body the request containing attendance data, including BLE signatures and timestamps
     */
    public void registerAttendance(final IotAttendanceUploadRequest body) {
        // Check the timestamp of the attendance record is within the last 7 days, otherwise drop the request
        if (body.getTimestamp().isBefore(java.time.LocalDateTime.now().minusDays(ATTENDANCE_RECORD_EXPIRY_DAYS))) {
            return;
        }

        // Iterate through the attendance records in the request body and process them
        for (var record : body.getSignatures()) {
            // Find the account associated with the BLE signature
            var account = accountRepository.findByBleSignature(record)
                    .orElse(null);

            if (account != null) {
                // If a clock-in event has been registered within the last minute, drop the entry
                if (clockInEventRepository.countByAccountAndTimeRange(
                        account.getAccountId(),
                        body.getTimestamp().minusMinutes(MINUTES_BETWEEN_CLOCK_INS),
                        body.getTimestamp().plusMinutes(MINUTES_BETWEEN_CLOCK_INS)
                ) > 0) {
                    continue;
                }

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
