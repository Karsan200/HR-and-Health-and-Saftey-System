import os
import time
import ujson
import _thread

from upload import upload
from scan import scan

# Check if the /cache directory exists, if not create it
if "cache" not in os.listdir():
    os.mkdir("cache")

# Check if the config file exists, if not create it
if "config.json" not in os.listdir():

    # TODO: In future this should start a network a user can join to initially flash the device with device_id,api_key,ssid,password

    with open("config.json", "w") as f:
        f.write("""
{
    "ssid": "",
    "password": "",
    "server_url": "https://api-ltp.tomsw.uk",
    "device_id": "",
    "api_key": "",
    "scanning_interval": 30,
    "upload_interval": 120,
    "rssi_threshold": -75,
    "max_cache_entries": 100
}
        """)

# Load the config
with open("config.json") as f:
    settings = ujson.load(f)

# TODO: In future this should attempt to load the network connection and set the RTC on the pico

# Start the uploading process
def upload_loop(interval: int):
    while True:
        upload()

        time.sleep(interval)

def scan_loop(interval: int):
    while True:
        scan()

        time.sleep(interval)

# Start the uploading thread
print("Uploading Thread Started")
_thread.start_new_thread(upload_loop, (settings["upload_interval"],))

# Main thread continues with BLE scanning
print("Scanning Thread Started")
scan_loop(settings["scanning_interval"])