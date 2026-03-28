## [V0.0.1] - 2026-03-26

### Added
- Scanning functionality for Rasperry Pi Pico (Tested on Pico W 2, with mock bluetooth signal + payload from a Pico W)
- Scanning fully utilises config.json, allowing modification of scan interval, etc.
- Scan expects 18 byte payload to be sent via BLE from another device (Consisting of a matching Company ID (2 bytes), followed by the raw binary UUID (16 bytes))
