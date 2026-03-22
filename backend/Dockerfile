FROM eclipse-temurin:21-jdk

WORKDIR /backend
COPY build/libs/*.jar app.jar

EXPOSE 5000
ENTRYPOINT ["java", "-jar", "/backend/app.jar"]