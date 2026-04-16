import ntptime
import time

from machine import RTC

_MAX_WIFI_RETRIES = 5
_WIFI_RETRY_DELAY = 5  # seconds


def connect_wifi(wlan, settings):
    """
    Attempt to connect to WiFi. Returns True on success, False after
    _MAX_WIFI_RETRIES failed attempts.
    """
    if wlan.isconnected():
        return True

    print("Connecting to WiFi...")
    wlan.connect(settings["ssid"], settings["password"])

    for attempt in range(1, _MAX_WIFI_RETRIES + 1):
        time.sleep(_WIFI_RETRY_DELAY)
        if wlan.isconnected():
            print("Connected! IP:", wlan.ifconfig()[0])

            # Update the RTC on the device
            ntptime.host = "time.cloudflare.com"
            ntptime.timeout = 5

            try:
                ntptime.settime()  # fetches time and sets the RTC to UTC
                print("RTC synced:", time.gmtime())
            except Exception as e:
                print("RTC sync failed:", e)

            return True
        print("WiFi attempt {}/{} failed".format(attempt, _MAX_WIFI_RETRIES))

    print("WiFi unavailable after {} attempts, skipping upload".format(_MAX_WIFI_RETRIES))
    return False
