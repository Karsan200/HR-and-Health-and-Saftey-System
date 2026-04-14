import os
import ujson
import urequests
import network


def convert_timestamp(s):
    date_part, time_part = s.split("_")

    yyyy = date_part[0:4]
    mm = date_part[4:6]
    dd = date_part[6:8]

    hh = time_part[0:2]
    mi = time_part[2:4]
    ss = time_part[4:6]

    return "{}-{}-{}T{}:{}:{}".format(yyyy, mm, dd, hh, mi, ss)

def upload():
    # Load the internet connection
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    # Load the config
    with open("config.json") as f:
        settings = ujson.load(f)

    for item in os.listdir("/cache"):
        item = item.replace(".csv", "")
        with open("/cache/" + item + ".csv") as f:
            # Skip the first line
            f.readline()

            # Get the recorded timestamp from the file name
            timestamp = convert_timestamp(item)

            lines = []
            end = False
            error = False
            while end == False:
                for _ in range(64):
                    line = f.readline()
                    if line == None or line == '':
                        end = True
                        break
                    else:
                        lines.append(line.replace("\n", "").split(",")[0])
                # Send the request to the server
                headers = {
                    "Content-Type": "application/json",
                    "X-Device-Id": settings["device_id"],
                    "X-Device-Token": settings["api_key"]
                }
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
                    print("Upload Status:", status)

                    if status < 200 or status >= 300:
                        raise Exception("Bad response: {}".format(status))

                except Exception as e:
                    print("Upload failed for '" + item + ".csv':", e)
                    error = True
                    break
                lines = []

            # Delete the file is there was no error uploading its content
            if not error:
                os.remove("/cache/" + item + ".csv")

    # Disconnect the internet
    wlan.active(False)

upload()