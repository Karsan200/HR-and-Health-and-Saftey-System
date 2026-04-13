package uk.co.garagebridgend.backend.logic;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.exception.UnauthorisedIotDeviceException;
import uk.co.garagebridgend.backend.repository.IotDeviceRepository;

import java.util.UUID;

@Service
public class IotService {

    private final IotDeviceRepository iotDeviceRepository;

    public IotService(final IotDeviceRepository iotDeviceRepositoryImpl) {
        this.iotDeviceRepository = iotDeviceRepositoryImpl;
    }

    public void authorise(final UUID deviceId, final String deviceToken) {
        // Find the device by ID and check if the token matches
        var device = iotDeviceRepository.findById(deviceId)
                .orElseThrow(UnauthorisedIotDeviceException::new);

        // Validate the access token
        if (!BCrypt.checkpw(deviceToken, device.getAccessToken())) {
            throw new UnauthorisedIotDeviceException();
        }
    }
}
