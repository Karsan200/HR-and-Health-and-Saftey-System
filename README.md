# Rent A Tech - Team 42a (Garage Guardian)



## Installation

### Backend
1. Clone the repository: `git clone https://git.cardiff.ac.uk/c23037502/rent-a-tech-team-42a.git`
2. Navigate to the backend directory: `cd rent-a-tech-team-42a/backend`
3. Configure your application.properties file with your database credentials and other necessary configurations.
```yaml
spring.application.name=Rent-A-Tech

spring.jpa.hibernate.ddl-auto=create-drop
spring.datasource.url=jdbc:mariadb://localhost:3306/rent_a_tech
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.datasource.username={ DATABASE USERNAME }
spring.datasource.password={ DATABASE PASSWORD }

minio.url=https://cdn-ltp.tomsw.uk/
minio.access.key={ MINIO ACCESS KEY }
minio.access.secret={ MINIO SECRET KEY }
minio.bucket.name=rent-a-tech-dev
minio.file.maxsize=10240

jwt.secret={ JWT SECRET TOKEN }
jwt.access_token_expiration=300000
jwt.refresh_token_expiration=3600
jwt.refresh_token_expiration_mobile=2592000
```
* For the database configuration, you must use MariaDB and create a database named `rent_a_tech`. You can use the following SQL command to create the database:
```sql
CREATE DATABASE rent_a_tech;
```
* For the MinIO configuration, you can set up a local MinIO server or use a cloud-based MinIO service or AWS S3 Object Storage. Make sure to replace the placeholders with your actual credentials and the URL of your MinIO server. If you are using a local MinIO server, the URL would typically be `http://localhost:9000/`.
* For the JWT configuration, generate a secure secret token and set appropriate expiration times for access and refresh tokens. Please note the expiration times are a Long integer so do not set values higher than `Long.MAX_VALUE` (9223372036854775807).

4. Build the project using Gradle: `./gradlew build`
5. Run the application: `./gradlew bootRun`

### Dummy Data
To populate the database with dummy data **(NOT FOR PRODUCTION)**, you can run the following SQL file after running the application for the first time to create the necessary tables:
```text
/backend/src/main/resources/dummyData.sql
```

## Authors and acknowledgment
- Kirsten Ashmead
- Thomas Brown
- Harley Doe
- Akshay Karsan 
- Mackenzie Thomas-Cox