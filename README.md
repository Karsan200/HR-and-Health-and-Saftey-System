# Rent A Tech - Team 42a (Garage Guardian)

## Installation

### Requirements
1. [This] Repository hosted on GitLab
2. A Cloudflare account
3. Virtual machine or server with at least 64GB storage, 4GB of RAM and 2 CPU cores (minimum)
4. Object storage solution (e.g., MinIO, AWS S3, Cloudflare R2) for storing uploaded files **(This guide will use Cloudflare R2)**
5. Raspberry Pi Pico 2 W for firmware deployment (optional for Clock In/Out System)
6. Thonny IDE for flashing the Raspberry Pi Pico 2 W (optional for Clock In/Out System)

### Setup
*This guide uses Ubuntu 24.04 as the operating system for the server*
#### Database (MariaDB)
Run these commands on your virtual machine or server to install MariaDB
```bash
sudo apt update
sudo apt install mariadb-server mariadb-client galera-4
sudo mariadb-secure-installation
```
after this step it will prompt you to set a root password and configure other security settings for the database. Remember these for later as you will need them to connect the backend to the database.

##### Create database
```bash
sudo mariadb -u root -p
CREATE DATABASE rent_a_tech;
```

#### Containerisation (Docker)
Run these commands on your virtual machine or server to install Docker
```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
#### Jenkins (CI/CD)
Run these commands on your virtual machine or server to install Jenkins
##### Install Java (Jenkins dependency)
```bash
sudo apt update
sudo apt install fontconfig openjdk-21-jre
java -version
```
##### Install Jenkins
```bash
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install jenkins
```
##### Start Jenkins
```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins
```

#### Other Considerations
- Port forwarding may need to be set up on your router to allow external access to the Jenkins server and the backend API. By default, Jenkins runs on port `8080`, so you would need to forward this port to the internal IP address of your server.
- The backend API runs on port `5000`, so you would also need to forward this port to allow external access to the API.
- If you are running on a server onsite you may want to consider products like Tailscale or Cloudflared to forward routes without needing a networking setup.

### Backend (API)
The backend is a Spring Boot application that is built and deployed to the server as a Docker container via a Jenkins pipeline job. There is no `Jenkinsfile` in the repository — the pipeline script is entered directly in Jenkins and contains all configuration inline.

#### Prerequisites
Before setting up the Jenkins pipeline, ensure the following are already in place on your server:
- Docker is installed and the `jenkins` user has permission to run Docker commands:
  ```bash
  sudo usermod -aG docker jenkins
  sudo systemctl restart jenkins
  ```
- MariaDB is running and the `rent_a_tech` database has been created (see above).
- An object storage bucket has been created (MinIO, Cloudflare R2, or AWS S3) and you have the endpoint URL, access key, secret key, and bucket name to hand.
#### Jenkins Configuration

##### 1. Add the GitLab Credential
The pipeline needs a credential to clone the repository. In the Jenkins dashboard, navigate to **Manage Jenkins → Credentials → System → Global credentials → Add Credentials** and add the following:

| Field | Value |
|-------|-------|
| Kind | Username with password |
| Username | Your GitLab username |
| Password | A GitLab personal access token with `read_repository` scope |
| ID | `rent-a-tech` |

> **Note:** The credential ID must be exactly `rent-a-tech` as this is what the pipeline script references.

##### 2. Create a Pipeline Job
1. From the Jenkins dashboard, click **New Item**.
2. Enter a name (e.g. `garage-guardian-backend`) and select **Pipeline**, then click **OK**.
3. Scroll down to the **Pipeline** section and set the **Definition** to **Pipeline script**.
4. Paste the pipeline script below into the script box.
5. Edit the values in the `Config` stage to match your environment (see the table below).
6. Click **Save**.
```groovy
pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                git branch: 'main',
                    url: 'https://git.cardiff.ac.uk/c23037502/rent-a-tech-team-42a.git',
                    credentialsId: 'rent-a-tech'
            }
        }
 
        stage('Config') {
            steps {
                sh '''
                cat <<EOF > backend/src/main/resources/application.properties
                spring.application.name=Rent-A-Tech
 
                spring.jpa.hibernate.ddl-auto=none
                spring.flyway.enabled=true
                spring.flyway.locations=classpath:db/migration
                spring.datasource.url=jdbc:mariadb://<DB_HOST>:3306/rent_a_tech
                spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
                spring.datasource.username=<DB_USERNAME>
                spring.datasource.password=<DB_PASSWORD>
 
                minio.url=<MINIO_URL>
                minio.access.key=<MINIO_ACCESS_KEY>
                minio.access.secret=<MINIO_SECRET_KEY>
                minio.bucket.name=<MINIO_BUCKET_NAME>
                minio.file.maxsize=10240
                jwt.secret=<JWT_SECRET>
                jwt.access_token_expiration=300000
                jwt.refresh_token_expiration=3600
                jwt.refresh_token_expiration_mobile=2592000
 
                leave.total-allowance-hours=160
                leave.minimum-advance-booking-days=14
                leave.max-approved-per-day=2
 
                leave.working-hours.monday-thursday.start=08:00
                leave.working-hours.monday-thursday.end=17:00
                leave.working-hours.friday.start=08:00
                leave.working-hours.friday.end=12:00
                server.port=5000
                EOF
                '''
            }
        }
 
        stage('Test') {
            steps {
                sh '''
                cd backend
                chmod +x gradlew
                ./gradlew clean check
                '''
            }
        }
 
        stage('Build') {
            steps {
                sh '''
                cd backend
                chmod +x gradlew
                ./gradlew clean build
                '''
            }
        }
 
        stage('Docker Build') {
            steps {
                sh '''
                docker build -t garagebridgend-backend:latest -f backend/Dockerfile backend
                '''
            }
        }
 
        stage('Docker Deploy') {
            steps {
                sh '''
                docker rm -f garagebridgend-backend || true
                docker run -d \
                    --name garagebridgend-backend \
                    --restart unless-stopped \
                    -p 5000:5000 \
                    garagebridgend-backend:latest
                '''
            }
        }
    }
}
```

##### Configuration Values
Replace each placeholder in the `Config` stage with the appropriate value for your environment:

| Placeholder | Description |
|-------------|-------------|
| `<DB_HOST>` | IP address of the server running MariaDB (e.g. `192.168.1.100`). Use the server's LAN IP, not `localhost`, as the backend runs inside Docker. |
| `<DB_USERNAME>` | MariaDB username (e.g. `root`) |
| `<DB_PASSWORD>` | MariaDB password set during `mariadb-secure-installation` |
| `<MINIO_URL>` | Full URL to your MinIO or S3-compatible endpoint including port (e.g. `http://192.168.1.100:9001/`) |
| `<MINIO_ACCESS_KEY>` | Access key for your object storage bucket |
| `<MINIO_SECRET_KEY>` | Secret key for your object storage bucket |
| `<MINIO_BUCKET_NAME>` | Name of the bucket to store uploaded files |
| `<JWT_SECRET>` | A Base64-encoded string used to sign JWT tokens. **Must be long enough** — too short will cause silent `500` errors on `/auth/login`. Generate one with: `openssl rand -base64 64` |

> ⚠️ **Security note:** The pipeline script stores all configuration values in plaintext within Jenkins. Treat access to the Jenkins dashboard as equivalent to access to these credentials, and restrict it accordingly.

##### 3. Run the Pipeline
Click **Build Now**. Jenkins will clone the repository, write `application.properties`, run tests, build the JAR, build a Docker image, and start the container. Check the build log for any errors.

To trigger the pipeline automatically on a push to GitLab, add a webhook in GitLab under **Settings → Webhooks**, pointing to `http://<jenkins-server-ip>:8080/gitlab/build_now`.

#### Verifying the Deployment
Once the pipeline completes, the API should be reachable at:
```
http://<your-server-ip>:5000
```
Confirm the container is running with:
```bash
docker ps
```
You should see `garagebridgend-backend` in the list with status `Up`.
 
---

### Desktop Admin Panel (Website)
The admin panel is a React/Vite application deployed to Cloudflare Pages via GitLab CI/CD. Once deployed, no server-side hosting is required — Cloudflare Pages handles all static asset delivery.

#### Prerequisites
- A Cloudflare account with Pages enabled.
- GitLab CI/CD variables configured for the repository.
#### Cloudflare Pages Setup

##### 1. Create a Pages Project
1. In the Cloudflare dashboard, navigate to **Workers & Pages → Create application → Pages**.
2. Select **Direct Upload** (the GitLab CI/CD pipeline will handle deployments rather than connecting Cloudflare directly to GitLab).
3. Give the project a name (e.g. `garage-guardian-admin`) and complete the setup. Note the project name as you will need it for the CI/CD configuration.
##### 2. Generate a Cloudflare API Token
1. In the Cloudflare dashboard, go to **My Profile → API Tokens → Create Token**.
2. Use the **Edit Cloudflare Workers** template, or create a custom token with **Cloudflare Pages: Edit** permissions.
3. Copy the token — you will need it in the next step.
#### GitLab CI/CD Configuration

In your GitLab repository, navigate to **Settings → CI/CD → Variables** and add the following:

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | The API token generated above |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (found in the Cloudflare dashboard sidebar) |
| `CF_ZONE_ID` | Your Cloudflare Zone ID (found in the Cloudflare dashboard under your domain's overview page) |

The `.gitlab-ci.yml` in the repository defines the pipeline. On a push to the configured branch, it will:
1. Install dependencies (`npm ci`).
2. Build the Vite app (`npm run build`).
3. Deploy the contents of the `dist/` folder to Cloudflare Pages using `wrangler pages deploy`.
#### Accessing the Admin Panel
Once deployed, Cloudflare Pages will provide a URL in the format:
```
https://garage-guardian-admin.pages.dev
```
You can also configure a custom domain in the Cloudflare Pages project settings.
 
---

### Mobile App
The mobile app is a React Native application distributed via the Google Play Store. The GitLab CI/CD pipeline handles building and pushing new releases to Google Play Console.

#### Prerequisites
- A Google Play Console developer account with the app already created.
- A signing keystore file for the release build.
- GitLab CI/CD variables configured for the repository.
#### Google Play Console Setup

##### 1. Create a Service Account
The CI/CD pipeline uses a Google Play service account to publish builds automatically.

1. In Google Play Console, navigate to **Setup → API access**.
2. Link your Google Play Console account to a Google Cloud project if you haven't already.
3. Click **Create new service account** and follow the link to Google Cloud Console.
4. In Google Cloud Console, create a service account and grant it the **Service Account User** role.
5. Create and download a JSON key for the service account.
6. Back in Google Play Console, grant the service account **Release manager** (or appropriate) permissions on your app.
#### GitLab CI/CD Configuration

In your GitLab repository, navigate to **Settings → CI/CD → Variables** and add the following:

| Variable | Description |
|----------|-------------|
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Base64-encoded contents of the Google Play service account JSON key file. Generate with: `base64 -w 0 service-account.json` |
| `KEY_ALIAS` | The key alias used when generating the keystore |
| `KEY_PASSWORD` | Password for the key alias |
| `KEYSTORE_BASE64` | Base64-encoded contents of your `.keystore` / `.jks` signing file. Generate with: `base64 -w 0 your.keystore` |
| `KEYSTORE_PASSWORD` | Password for the keystore |

The `.gitlab-ci.yml` in the repository defines the pipeline. On a push to the configured branch, it will:
1. Install dependencies (`npm ci`).
2. Build a signed release APK/AAB using the keystore credentials.
3. Upload the build to Google Play Console using the service account, targeting the configured track (e.g. `internal`, `alpha`, or `production`).
#### Installing the App
Once the pipeline has run and the release has been published in Google Play Console, the app can be downloaded from the Play Store. During development, use the **Internal testing** track to distribute to testers before a wider release.
 
---

### Clock In/Out System (Firmware)
The Clock In/Out system runs on a Raspberry Pi Pico 2 W flashed with MicroPython firmware. The device scans for nearby BLE advertisements from employee devices and reports attendance events to the backend API over WiFi.

#### Prerequisites
- A Raspberry Pi Pico 2 W.
- [Thonny IDE](https://thonny.org/) installed on your computer.
- The MicroPython firmware for the Pico 2 W (`.uf2` file) — available from the [MicroPython downloads page](https://micropython.org/download/RPI_PICO2_W/).
- The backend API is deployed and accessible from the same network as the Pico.
#### 1. Flash MicroPython onto the Pico
1. Hold the **BOOTSEL** button on the Pico and plug it into your computer via USB. It will appear as a mass storage device called `RPI-RP2`.
2. Drag and drop the MicroPython `.uf2` file onto the `RPI-RP2` drive. The Pico will reboot automatically and is now running MicroPython.
#### 2. Configure Thonny
1. Open Thonny and go to **Tools → Options → Interpreter**.
2. Set the interpreter to **MicroPython (Raspberry Pi Pico)**.
3. Select the correct COM port / serial device for your Pico and click **OK**.
4. You should see the MicroPython REPL prompt (`>>>`) in the Thonny shell.
#### 3. Create the Configuration File
The firmware reads its settings from a `config.json` file that must be uploaded to the Pico alongside the main code. If `config.json` is not present on boot, the device will create a blank template automatically — you can then edit and re-upload it, or create it manually from the start using the structure below:

```json
{
    "ssid": "YOUR_WIFI_NETWORK_NAME",
    "password": "YOUR_WIFI_PASSWORD",
    "server_url": "https://your-server-url",
    "device_id": "pico-entrance-01",
    "api_key": "YOUR_API_KEY",
    "scanning_interval": 15,
    "upload_interval": 60,
    "rssi_threshold": -75,
    "max_cache_entries": 100
}
```

| Field | Description |
|-------|-------------|
| `ssid` | WiFi network name the Pico should connect to |
| `password` | WiFi password |
| `server_url` | Full URL of the deployed backend API |
| `device_id` | Unique identifier for this device — used by the backend to identify which reader reported an event |
| `api_key` | API key used to authenticate requests to the backend |
| `scanning_interval` | How often (in seconds) the device scans for BLE advertisements |
| `upload_interval` | How often (in seconds) the device uploads cached events to the backend |
| `rssi_threshold` | Minimum signal strength (in dBm) for a BLE device to be recorded — devices with a weaker signal than this value are ignored (e.g. `-75`) |
| `max_cache_entries` | Maximum number of BLE events to hold in memory before uploading |

#### 4. Upload Files to the Pico
Using Thonny's file browser (**View → Files**):
1. Navigate to the project's `firmware/` directory on your computer (left panel).
2. Upload `config.json` to the root of the Pico filesystem (right panel) by right-clicking and selecting **Upload to /**.
3. Upload `main.py` (and any other required source files) to the root of the Pico filesystem in the same way.
#### 5. Run the Firmware
With `main.py` on the device, the firmware will run automatically on boot. You can also press **F5** in Thonny to run it immediately and observe output in the shell for debugging.

On startup, the device will:
1. Connect to the configured WiFi network.
2. Begin scanning for BLE advertisements from registered employee devices.
3. Send attendance events to the backend API at `api_base_url` as employees come into range.
#### Deploying Multiple Devices
Repeat steps 1–5 for each additional Pico. Ensure each device has a unique `device_id` in its `config.json`. All devices can point to the same `api_base_url`.
 
---

## Authors and acknowledgment
- Kirsten Ashmead
- Thomas Brown
- Harley Doe
- Akshay Karsan 
- Mackenzie Thomas-Cox