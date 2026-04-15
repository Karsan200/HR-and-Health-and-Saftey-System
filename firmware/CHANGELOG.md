## [V0.4.0] - TBD

### Added
- Radio locking so Bluetooth and Wi-Fi cannot be used at the same time on the Pico to avoid disruption to receiving and sending data
- Internet connection to set the RTC on the pico to ensure the correct time is recorded for clock in events
- Functionality to upload cached events to the backend when an internet connection is available, and delete the cached events file once the upload is successful
  - Uploads cache events in batches of 64 so that a maximum of 2KB of memory is used at once

### Removed
- Redundant status column on the CSV cache files to save storage

### Fixed
- Issue where the radio on the Pico was being used for both Wi-Fi and Bluetooth causing disruption to receiving and sending data, added radio locking to avoid this
- Issue where the scan function appended a new line a cached events file, causing reading the file to fail

## [V0.2.0] - 2026-03-31

### Added
- Scanning functionality for Raspberry Pi Pico (Tested on Pico W 2, with mock bluetooth signal + payload from a Pico W)
- Scanning fully utilises config.json, allowing modification of scan interval, etc.
- Scan expects 18 byte payload to be sent via BLE from another device (Consisting of a matching Company ID (2 bytes), followed by the raw binary UUID (16 bytes))
