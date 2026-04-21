import os
import time
import ujson
import _thread
import network

from internet import connect_wifi
from upload import upload
from scan import scan

radio_lock = _thread.allocate_lock()

# Check if the /cache directory exists, if not create it
if "cache" not in os.listdir():
    os.mkdir("cache")

# Check if the config file exists, if not create it
if "config.json" not in os.listdir():
    # TODO: In future this should start a network a user can join to initially flash the device with device_id,api_key,ssid,password
    with open("config.json", "w") as f:
        f.write("""{
    "ssid": "VM6474747-plus",
    "password": "jy8DdckmRxqx",
    "server_url": "http://192.168.0.212:8080",
    "device_id": "9b4cfe01-3835-11f1-b008-18c04d1acf19",
    "api_key": "password",
    "scanning_interval": 15,
    "upload_interval": 60,
    "rssi_threshold": -75,
    "max_cache_entries": 100
}""")

# Load the config
with open("config.json") as f:
    settings = ujson.load(f)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

connected = False
# Connect to Wi-Fi
while not connected:
    connected = connect_wifi(wlan, settings)

def upload_loop(interval):
    while True:
        upload(radio_lock)
        time.sleep(interval)

def scan_loop(interval):
    while True:
        with radio_lock:
            scan()
        time.sleep(interval)

print("Upload thread started")
_thread.start_new_thread(upload_loop, (settings["upload_interval"],))

print("Scan loop started")
scan_loop(settings["scanning_interval"])