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

### Backend (API)

### Desktop Admin Panel (Website)

### Mobile App

### Clock In/Out System (Firmware)

## Authors and acknowledgment
- Kirsten Ashmead
- Thomas Brown
- Harley Doe
- Akshay Karsan 
- Mackenzie Thomas-Cox