import bluetooth
import struct
import time
import ujson


# Company ID, 16 bit little endian 
COMPANY_ID = 0xFFFF


def _get_timestamp():
    """Return a formatted timestamp string for use as a filename."""
    t = time.localtime()
    return "{:04d}{:02d}{:02d}_{:02d}{:02d}{:02d}".format(
        t[0], t[1], t[2], t[3], t[4], t[5]
    )


def _load_settings():
    # Load settings from config.json.
    try:
        with open("config.json") as f:
            return ujson.load(f)
    except Exception:
        # Fallback for if config fails.
        return {"rssi_threshold": -75, "max_cache_entries": 100}


def _parse_adv_data(adv_data):
    """
    Walk the BLE advertisement data structures looking for a
    Manufacturer Specific Data record (AD type 0xFF) that matches
    COMPANY_ID. If found, the remaining bytes are decoded as a
    UTF-8 employee ID string and returned. Returns None if no
    matching record is found.

    Advertisement data is a sequence of Length-Type-Value triplets:
        [length (1 byte)] [AD type (1 byte)] [payload (length-1 bytes)]
    """
    i = 0
    while i < len(adv_data):
        length = adv_data[i]
        if length == 0:
            break

        # Guard against malformed packets running past the buffer end
        if i + length >= len(adv_data):
            break

        ad_type = adv_data[i + 1]
        payload = adv_data[i + 2 : i + 1 + length]

        # 0xFF = Manufacturer Specific Data
        # Minimum meaningful payload: 2 bytes company ID + 1 byte of data
        if ad_type == 0xFF and len(payload) >= 3:
            company_id = payload[0] | (payload[1] << 8)
            if company_id == COMPANY_ID:
                try:
                    employee_id = bytes(payload[2:]).decode("utf-8").strip("\x00").strip()
                    if employee_id:
                        return employee_id
                except Exception:
                    pass

        i += 1 + length

    return None


def scan():
    """
    Perform a BLE scan and collect employee IDs from devices running
    the HR app. Only devices broadcasting a manufacturer-specific
    advertisement with COMPANY_ID are recorded.

    Results are written to /cache/<timestamp>.csv with a 'pending'
    status for each entry.

    CSV format:
        employee_id,rssi,status
        EMP-00142,-65,pending
    """
    settings = _load_settings()
    rssi_threshold = settings.get("rssi_threshold", -75)
    max_entries = settings.get("max_cache_entries", 100)

    # Duration in ms — scan for 5 seconds
    SCAN_DURATION_MS = 5000
    SCAN_INTERVAL_US = 30000
    SCAN_WINDOW_US   = 30000

    # employee_id, store best rssi seen during this scan
    seen = {}

    ble = bluetooth.BLE()
    ble.active(True)

    scan_done = False

    def _irq(event, data):
        nonlocal scan_done

        # _IRQ_SCAN_RESULT = 5
        if event == 5:
            addr_type, addr, adv_type, rssi, adv_data = data

            # Apply RSSI threshold and ignore distant devices
            if rssi < rssi_threshold:
                return

            employee_id = _parse_adv_data(bytes(adv_data))
            if employee_id is None:
                # Device is not running the HR app; skip it
                return

            # Keep only the strongest RSSI seen for each employee
            if employee_id not in seen or rssi > seen[employee_id]:
                seen[employee_id] = rssi

        # _IRQ_SCAN_DONE = 6
        elif event == 6:
            scan_done = True

    ble.irq(_irq)

    try:
        ble.gap_scan(SCAN_DURATION_MS, SCAN_INTERVAL_US, SCAN_WINDOW_US)

        # Wait for scan to finish (poll with a small sleep)
        deadline = time.ticks_add(time.ticks_ms(), SCAN_DURATION_MS + 1000)
        while not scan_done:
            if time.ticks_diff(deadline, time.ticks_ms()) <= 0:
                break
            time.sleep_ms(100)

    except Exception as e:
        print("BLE scan error:", e)
    finally:
        ble.active(False)

    if not seen:
        print("scan: no HR app devices found above RSSI threshold")
        return

    # Sort by strongest signal, cap at max_entries
    sorted_devices = sorted(seen.items(), key=lambda x: x[1], reverse=True)
    sorted_devices = sorted_devices[:max_entries]

    # Write CSV to /cache/<timestamp>.csv
    timestamp = _get_timestamp()
    filepath = "/cache/{}.csv".format(timestamp)

    try:
        with open(filepath, "w") as f:
            f.write("employee_id,rssi,status\n")
            for employee_id, rssi in sorted_devices:
                f.write("{},{},pending\n".format(employee_id, rssi))

        print("scan: wrote {} employee(s) to {}".format(len(sorted_devices), filepath))

    except Exception as e:
        print("scan: failed to write CSV:", e)