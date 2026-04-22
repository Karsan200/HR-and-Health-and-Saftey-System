"""
Flash this onto pico device to create a bluetooth advertisement for a user.
Ensure COMPANY_ID and DEVICE_UUID match details required.
"""

import bluetooth
import time

# Must match the COMPANY_ID in scan.py on the receiver Pico W
COMPANY_ID = 0x0000

# The UUID to advertise — replace with a real UUID from your database
DEVICE_UUID = "0fd0708f-35d1-11f1-95af-bc2411e62287"


def _uuid_str_to_bytes(uuid_str):
    """
    Convert a standard hyphenated UUID string to 16 raw bytes.
    e.g. '550e8400-e29b-41d4-a716-446655440000' -> b'\\x55\\x0e\\x84\\x00...'
    """
    hex_str = uuid_str.replace("-", "")
    return bytes([int(hex_str[i:i+2], 16) for i in range(0, 32, 2)])


def _build_adv_payload():
    """
    Build a raw BLE advertisement payload containing a single
    Manufacturer Specific Data record (AD type 0xFF).

    Structure:
        [length][0xFF][company_id_low][company_id_high][uuid_bytes: 16 bytes]
    """
    print(COMPANY_ID)
    company_bytes = bytes([COMPANY_ID & 0xFF, (COMPANY_ID >> 8) & 0xFF])
    uuid_bytes = _uuid_str_to_bytes(DEVICE_UUID)

    # The payload for the AD structure (everything after the length byte)
    ad_data = bytes([0x00]) + company_bytes + uuid_bytes

    # Length byte = number of bytes that follow it
    return bytes([len(ad_data)]) + ad_data


def advertise():
    """
    Continuously advertise a binary UUID using a manufacturer-specific
    BLE advertisement payload. The device will keep advertising until
    interrupted or powered off.
    """
    payload = _build_adv_payload()

    ble = bluetooth.BLE()
    ble.active(True)

    print("Starting BLE advertisement for UUID: {}".format(DEVICE_UUID))
    print("Payload bytes:", list(payload))

    try:
        # gap_advertise(interval_us, adv_data)
        # 500_000 us = 500 ms interval between advertisements
        ble.gap_advertise(500_000, adv_data=payload)
        print("Advertising... (press Ctrl+C to stop)")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("Stopping advertisement.")
    finally:
        ble.gap_advertise(None)  # Stop advertising
        ble.active(False)


advertise()