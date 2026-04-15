package uk.co.garagebridgend.backend.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * AttendanceSchedule is a Spring component responsible for scheduling tasks related to employee attendance.
 * It includes a scheduled method that runs daily at midnight to generate clock-in events for all employees.
 */
@Component
public class AttendanceSchedule {
    /** Logger instance for logging scheduled task execution details.*/
    private static final Logger LOG = LoggerFactory.getLogger(AttendanceSchedule.class);

    /**
     * Scheduled task that runs daily at midnight to generate clock-in events for all employees.
     * This method is currently a placeholder and should be implemented to create clock-in events
     * based on the business logic of the application.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyClockInEvents() {
        LOG.info("Running scheduled clock in event task at {}", LocalDateTime.now());


    }

}
