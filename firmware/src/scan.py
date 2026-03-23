import bluetooth
import struct
import time
import ujson


def _get_timestamp():
    """Return a formatted timestamp string for use as a filename."""
    t = time.localtime()
    return "{:04d}{:02d}{:02d}_{:02d}{:02d}{:02d}".format(
        t[0], t[1], t[2], t[3], t[4], t[5]
    )


def _mac_to_str(addr_bytes):
    """Convert 6-byte MAC address bytes to a colon-separated hex string."""
    return ":".join("{:02X}".format(b) for b in addr_bytes)


def _load_settings():
    """Load settings from config.json."""
    try:
        with open("config.json") as f:
            return ujson.load(f)
    except Exception:
        """Fallback for if config fails."""
        return {"rssi_threshold": -75, "max_cache_entries": 100}


def scan():
    """
    Perform a BLE scan, collect unique MAC addresses, and write results
    to /cache/<timestamp>.csv with a 'pending' status for each entry.

    CSV format:
        mac_address,rssi,status
        AA:BB:CC:DD:EE:FF,-65,pending
    """
    settings = _load_settings()
    rssi_threshold = settings.get("rssi_threshold", -75)
    max_entries = settings.get("max_cache_entries", 100)

    # Duration in ms — scan for 5 seconds
    SCAN_DURATION_MS = 5000
    SCAN_INTERVAL_US = 30000
    SCAN_WINDOW_US   = 30000

    seen = {}  # mac_str -> best rssi seen during this scan

    ble = bluetooth.BLE()
    ble.active(True)

    scan_done = False

    def _irq(event, data):
        nonlocal scan_done

        # _IRQ_SCAN_RESULT = 5
        if event == 5:
            # data: (addr_type, addr, adv_type, rssi, adv_data)
            addr_type, addr, adv_type, rssi, adv_data = data
            mac = _mac_to_str(bytes(addr))

            # Apply RSSI threshold filter
            if rssi < rssi_threshold:
                return

            # Keep only the strongest RSSI seen for each device
            if mac not in seen or rssi > seen[mac]:
                seen[mac] = rssi

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
        print("scan: no devices found above RSSI threshold")
        return

    # Respect max_cache_entries while keeping the strongest signals if over limit
    sorted_devices = sorted(seen.items(), key=lambda x: x[1], reverse=True)
    sorted_devices = sorted_devices[:max_entries]

    # Write CSV to /cache/<timestamp>.csv
    timestamp = _get_timestamp()
    filepath = "/cache/{}.csv".format(timestamp)

    try:
        with open(filepath, "w") as f:
            f.write("mac_address,rssi,status\n")
            for mac, rssi in sorted_devices:
                f.write("{},{},pending\n".format(mac, rssi))

        print("scan: wrote {} device(s) to {}".format(len(sorted_devices), filepath))

    except Exception as e:
        print("scan: failed to write CSV:", e)