import os
import time
import _thread

from upload import upload
from scan import scan

# Check if the /cache directory exists, if not create it
if not ("cache" in os.listdir):
    os.mkdir("cache")
    
# Check if the config file exists, if not create it
if not ("config.json" in os.listdir):
    f = open("config.json", "w")
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
    
# Load the settings
with open("settings.json") as f:
    settings = ujson.load(f)
    
# Start the uploading process
def upload_loop():
    while True:
        upload()
        
        time.sleep(settings["upload_interval"])
_thread.start_new_thread(upload_loop, ())

# Main thread continues with BLE scanning
while True:
    scan()
    
    time.sleep(settings["scanning_interval"])