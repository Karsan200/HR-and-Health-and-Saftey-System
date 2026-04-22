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

### Mobile App

### Clock In/Out System (Firmware)

## Authors and acknowledgment
- Kirsten Ashmead
- Thomas Brown
- Harley Doe
- Akshay Karsan 
- Mackenzie Thomas-Cox