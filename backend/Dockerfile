FROM eclipse-temurin:21-jdk

WORKDIR /backend
COPY build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/backend/app.jar"]