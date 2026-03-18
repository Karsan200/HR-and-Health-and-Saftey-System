package uk.co.garagebridgend.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

/**
 * Main Spring Boot application class for the RentATech backend.
 * <p>
 * Starts the application context and exposes any lightweight controller
 * endpoints defined on this class (if needed).
 */
@SpringBootApplication
@RestController
public class RentATechApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentATechApplication.class, args);
    }
}
