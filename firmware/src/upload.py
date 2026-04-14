import os
import ujson


def upload():
    # Load the config
    with open("config.json") as f:
        settings = ujson.load(f)

    for item in os.listdir("/cache"):
        with open("/cache/" + item) as f:
            # Skip the first line
            f.readline()

            lines = []
            end = False
            while end == False:
                for _ in range(64):
                    line = f.readline()
                    if line == None or line == '':
                        end = True
                        break
                    else:
                        lines.append(line.replace("\n", "").split(",")[0])
                print(lines)
                lines = []


upload()
