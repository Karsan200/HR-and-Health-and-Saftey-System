"""
Flash this onto pico device to create a bluetooth advertisement for a user.
Ensure COMPANY_ID and EMPLOYEE_ID match details required.
"""

import bluetooth
import time

# Must match the COMPANY_ID in scan.py on the receiver Pico W
COMPANY_ID = 0xFFFF

# The employee/account ID to advertise, change this per device/employee
EMPLOYEE_ID = "1"


def _build_adv_payload():
    """
    Build a raw BLE advertisement payload containing a single
    Manufacturer Specific Data record (AD type 0xFF).

    Structure:
        [length][0xFF][company_id_low][company_id_high][employee_id_bytes...]
    """
    company_bytes = bytes([COMPANY_ID & 0xFF, (COMPANY_ID >> 8) & 0xFF])
    employee_bytes = EMPLOYEE_ID.encode("utf-8")

    # The payload for the AD structure (everything after the length byte)
    ad_data = bytes([0xFF]) + company_bytes + employee_bytes

    # Length byte = number of bytes that follow it
    return bytes([len(ad_data)]) + ad_data


def advertise():
    """
    Continuously advertise as employee ID 1 using a manufacturer-specific
    BLE advertisement payload. The device will keep advertising until
    interrupted or powered off.
    """
    payload = _build_adv_payload()

    ble = bluetooth.BLE()
    ble.active(True)

    print("Starting BLE advertisement for employee ID: {}".format(EMPLOYEE_ID))
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