import os
import ujson
import urequests
import network

from internet import connect_wifi

def convert_timestamp(s):
    date_part, time_part = s.split("_")
    yyyy = date_part[0:4]
    mm = date_part[4:6]
    dd = date_part[6:8]
    hh = time_part[0:2]
    mi = time_part[2:4]
    ss = time_part[4:6]
    return "{}-{}-{}T{}:{}:{}".format(yyyy, mm, dd, hh, mi, ss)

def upload(radio_lock):
    with radio_lock:
        with open("config.json") as f:
            settings = ujson.load(f)

        wlan = network.WLAN(network.STA_IF)

        if not connect_wifi(wlan, settings):
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