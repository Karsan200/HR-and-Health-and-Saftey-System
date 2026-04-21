# Rent A Tech - Team 42a (Garage Guardian)

## Installation

## Requirements
1. [This] Repository hosted on GitLab
2. A Cloudflare account
3. Virtual machine or server with at least 4GB of RAM and 2 CPU cores (minimum)
4. Object storage solution (e.g., MinIO, AWS S3, Cloudflare R2) for storing uploaded files **(This guide will use Cloudflare R2)**
5. Raspberry Pi Pico 2 W for firmware deployment (optional for Clock In/Out System)
6. Thonny IDE for flashing the Raspberry Pi Pico 2 W (optional for Clock In/Out System)

### Backend
1. Clone the repository: `git clone https://git.cardiff.ac.uk/c23037502/rent-a-tech-team-42a.git`
2. Navigate to the backend directory: `cd rent-a-tech-team-42a/backend`
3. Configure your application.properties file with your database credentials and other necessary configurations.
```yaml
spring.application.name=Rent-A-Tech

  # --- FOR DEVELOPMENT USE ONLY ---
spring.jpa.hibernate.ddl-auto=create-drop
spring.flyway.enabled=false
  # --- ---
  # --- FOR PRODUCTION USE ONLY ---
spring.jpa.hibernate.ddl-auto=none
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
  # --- ---
spring.datasource.url=jdbc:mariadb://localhost:3306/rent_a_tech
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.username={ DATABASE USERNAME }
spring.datasource.password={ DATABASE PASSWORD }

minio.url=https://cdn-ltp.tomsw.uk/
minio.access.key={ MINIO ACCESS KEY }
minio.access.secret={ MINIO SECRET KEY }
minio.bucket.name=rent-a-tech-dev
minio.file.maxsize=10240

jwt.secret={ Base64 JWT SECRET TOKEN }
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
```
* For the database configuration, you must use MariaDB and create a database named `rent_a_tech`. You can use the following SQL command to create the database:
```sql
CREATE DATABASE rent_a_tech;
```
* For the MinIO configuration, you can set up a local MinIO server or use a cloud-based S3 compatible object storage solution such as AWS S3 or Cloudflare R2. Make sure to replace the placeholders with your actual credentials and the URL of your MinIO server. If you are using a local MinIO server, the URL would typically be `http://localhost:9000/`.
* For the JWT configuration, generate a secure secret token and set appropriate expiration times for access and refresh tokens. Please note the expiration times are a Long integer so do not set values higher than `Long.MAX_VALUE` (9223372036854775807).

4. Build the project using Gradle: `./gradlew build`
5. Run the application: `./gradlew bootRun`

### Dummy Data (Development Only)
To populate the database with dummy data, you can run the following SQL file after running the application for the first time to create the necessary tables:
```text
/backend/src/main/resources/dummyData.sql
```

## Authors and acknowledgment
- Kirsten Ashmead
- Thomas Brown
- Harley Doe
- Akshay Karsan 
- Mackenzie Thomas-Cox