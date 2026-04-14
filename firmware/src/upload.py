import os
import ujson
import urequests
import network
import time

def convert_timestamp(s):
    date_part, time_part = s.split("_")
    yyyy = date_part[0:4]
    mm = date_part[4:6]
    dd = date_part[6:8]
    hh = time_part[0:2]
    mi = time_part[2:4]
    ss = time_part[4:6]
    return "{}-{}-{}T{}:{}:{}".format(yyyy, mm, dd, hh, mi, ss)

_MAX_WIFI_RETRIES = 5
_WIFI_RETRY_DELAY = 5  # seconds

def _connect_wifi(wlan, settings):
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
            return True
        print("WiFi attempt {}/{} failed".format(attempt, _MAX_WIFI_RETRIES))

    print("WiFi unavailable after {} attempts, skipping upload".format(_MAX_WIFI_RETRIES))
    return False

def upload(radio_lock):
    with radio_lock:
        with open("config.json") as f:
            settings = ujson.load(f)

        wlan = network.WLAN(network.STA_IF)

        if not _connect_wifi(wlan, settings):
            return

        for item in os.listdir("/cache"):
            item = item.replace(".csv", "")
            with open("/cache/" + item + ".csv") as f:
                f.readline()  # skip header

                timestamp = convert_timestamp(item)
                headers = {
                    "Content-Type": "application/json",
                    "X-Device-Id": settings["device_id"],
                    "X-Device-Token": settings["api_key"]
                }

                lines = []
                end = False
                error = False

                while not end:
                    for _ in range(64):
                        line = f.readline()
                        if line == "":
                            end = True
                            break
                        lines.append(line.replace("\n", "").split(",")[0])

                    if not lines:
                        break

                    try:
                        response = urequests.post(
                            settings["server_url"] + "/api/iot/attendance/upload",
                            data=ujson.dumps({
                                "signatures": lines,
                                "timestamp": timestamp
                            }),
                            headers=headers
                        )

                        status = response.status_code
                        print("Upload status:", status)

                        if status < 200 or status >= 300:
                            print("Response:", response.text)
                            raise Exception("Bad response: {}".format(status))

                        response.close()

                    except Exception as e:
                        print("Upload failed for '{}.csv':".format(item), e)
                        error = True
                        break

                    lines = []

            if not error:
                os.remove("/cache/" + item + ".csv")