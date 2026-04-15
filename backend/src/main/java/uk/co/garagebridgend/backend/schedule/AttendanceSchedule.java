package uk.co.garagebridgend.backend.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInEventRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * AttendanceSchedule is a Spring component responsible for scheduling tasks related to employee attendance.
 * It includes a scheduled method that runs daily at midnight to generate clock-in events for all employees.
 */
@Component
public class AttendanceSchedule {
    /** Logger instance for logging scheduled task execution details.*/
    private static final Logger LOG = LoggerFactory.getLogger(AttendanceSchedule.class);

    /** Repository for accessing account data, used to retrieve employee information for generating clock-in events. */
    private final AccountRepository accountRepository;

    /** Repository for managing clock-in event data, used to create and store clock-in events in the database. */
    private final ClockInEventRepository clockInEventRepository;

    /** Repository for managing clock-in records, potentially used for additional clock-in related operations. */
    private final ClockInRepository clockInRepository;

    /**
     * Constructor for AttendanceSchedule that initializes the required repositories for managing attendance-related data.
     * @param accountRepositoryImpl the repository implementation for accessing account data
     * @param clockInEventRepositoryImpl the repository implementation for managing clock-in event data
     * @param clockInRepositoryImpl the repository implementation for managing clock-in records
     */
    public AttendanceSchedule(
            AccountRepository accountRepositoryImpl,
            ClockInEventRepository clockInEventRepositoryImpl,
            ClockInRepository clockInRepositoryImpl
    ) {
        this.accountRepository = accountRepositoryImpl;
        this.clockInEventRepository = clockInEventRepositoryImpl;
        this.clockInRepository = clockInRepositoryImpl;
    }

    /**
     * Scheduled task that runs daily at midnight to generate clock-in events for all employees.
     * This method is currently a placeholder and should be implemented to create clock-in events
     * based on the business logic of the application.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyClockInEvents() {
        LOG.info("Running scheduled clock in event task at {}", LocalDateTime.now());

        // Select all employees from the database
        List<AccountTable> employees = accountRepository.findAll();

        // Get the dates that have clock in events
        List<LocalDate> eventDates = clockInEventRepository.findDistinctDates();

        // Iterate through the dates and add clock in events for each employee
        for (LocalDate date : eventDates) {
            for (AccountTable employee : employees) {
                // Get the clock in events for the employee on the date
                var events = clockInEventRepository.findByDateAndAccount(date, employee.getAccountId());

                if (events.isEmpty()) continue;

                // Check if there is a clock in record for the employee on the date
                LocalDateTime start = date.atStartOfDay();
                LocalDateTime end = date.plusDays(1).atStartOfDay();

                List<ClockInTable> record = clockInRepository.findAllForEmployeeWithinDateRange(
                        employee.getAccountId(), start, end
                );

                // If there is no record, create a new one with the clock in events
                if (record.isEmpty()) {
                    // If there is only 1 event, set the start time, then end time as null
                    if (events.size() == 1) {
                        var clock = new ClockInTable();
                        clock.setAccount(employee);
                        clock.setClockInTime(LocalTime.from(events.getFirst().getCreated()));
                        clock.setClockOutTime(null);
                        clock.setCreated(events.getFirst().getCreated());
                        clockInRepository.save(clock);
                    } else {
                        var clock = new ClockInTable();
                        clock.setAccount(employee);
                        clock.setClockInTime(LocalTime.from(events.getFirst().getCreated()));
                        clock.setClockOutTime(LocalTime.from(events.getLast().getCreated()));
                        clock.setCreated(events.getLast().getCreated());
                        clockInRepository.save(clock);
                    }
                } else {
                    // If the record has not been admin edited, and there are more than 2 events then update the record
                    var clock = record.getFirst();
                    if (!clock.isAdminAdjusted() && events.size() >= 2) {
                        // If the new event is earlier than the start time
                        if (LocalTime.from(events.getFirst().getCreated()).isBefore(clock.getClockInTime())) {
                            clock.setClockInTime(LocalTime.from(events.getFirst().getCreated()));
                        }
                        // If clock out record is null or the new event is later than the end time
                        if (clock.getClockOutTime() == null
                                || LocalTime.from(events.getLast().getCreated()).isAfter(clock.getClockOutTime())) {
                            clock.setClockOutTime(LocalTime.from(events.getLast().getCreated()));
                            clock.setCreated(events.getLast().getCreated());
                        }
                        clockInRepository.save(clock);
                    }
                }

                // Delete the clock in events for the date and employee
                clockInEventRepository.deleteByDateAndAccountId(date, employee.getAccountId());
            }
        }
    }

}
