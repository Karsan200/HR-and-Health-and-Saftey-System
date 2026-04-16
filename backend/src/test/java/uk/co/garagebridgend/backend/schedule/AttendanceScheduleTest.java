package uk.co.garagebridgend.backend.schedule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInEventTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInEventRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
class AttendanceScheduleTest {

    @Autowired
    private AttendanceSchedule attendanceSchedule;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ClockInEventRepository clockInEventRepository;

    @Autowired
    private ClockInRepository clockInRepository;

    private AccountTable employee;
    private static final LocalDate TEST_DATE = LocalDate.now().minusDays(1);

    @BeforeEach
    void setUp() {
        employee = new AccountTable();
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setUsername("johnd18");
        employee.setEmail("johnd@test.com");
        employee.setPassword(BCrypt.hashpw("hashedPassword", BCrypt.gensalt()));
        employee.setMobilePin(BCrypt.hashpw("123456", BCrypt.gensalt()));
        employee.setTwoFactorSecret("NGXEIJWEXZ7NLRKF3P7VMRQMQ4GAT65Y");
        employee.setAddressOne("123 Main St");
        employee.setPostalCode("12345");
        employee.setBleSignature(UUID.fromString("b64a8d42-cb4b-442e-b4ba-8ec3a80a0e30"));
        // set any other non-nullable fields your entity requires
        accountRepository.save(employee);
    }

    @Test
    void freshRecord_singleEvent_clockOutIsNull() {
        saveEvent(TEST_DATE.atTime(9, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertNull(records.getFirst().getClockOutTime());
    }

    @Test
    void freshRecord_twoEvents_firstAndLastUsed() {
        saveEvent(TEST_DATE.atTime(9, 0));
        saveEvent(TEST_DATE.atTime(17, 30));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 30), records.getFirst().getClockOutTime());
    }

    @Test
    void freshRecord_threeEvents_firstAndLastUsed() {
        saveEvent(TEST_DATE.atTime(9, 0));
        saveEvent(TEST_DATE.atTime(12, 0));
        saveEvent(TEST_DATE.atTime(17, 30));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 30), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_twoEvents_earlierClockInUpdated() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        saveEvent(TEST_DATE.atTime(8, 45));
        saveEvent(TEST_DATE.atTime(17, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(8, 45), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_twoEvents_laterClockOutUpdated() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        saveEvent(TEST_DATE.atTime(9, 0));
        saveEvent(TEST_DATE.atTime(18, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(18, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_twoEvents_nullClockOutGetsSet() {
        saveExistingRecord(LocalTime.of(9, 0), null, false);
        saveEvent(TEST_DATE.atTime(9, 0));
        saveEvent(TEST_DATE.atTime(17, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_twoEvents_noChangeNeeded_recordUnchanged() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        saveEvent(TEST_DATE.atTime(9, 30));
        saveEvent(TEST_DATE.atTime(16, 30));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_singleEvent_earlierThanClockIn_clockInUpdated() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        saveEvent(TEST_DATE.atTime(8, 30));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(LocalTime.of(8, 30), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_singleEvent_nullClockOut_clockOutSet() {
        saveExistingRecord(LocalTime.of(9, 0), null, false);
        saveEvent(TEST_DATE.atTime(17, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_singleEvent_laterThanClockOut_clockOutUpdated() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        saveEvent(TEST_DATE.atTime(18, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(18, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void existingRecord_singleEvent_betweenClockInAndOut_noChange() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), false);
        saveEvent(TEST_DATE.atTime(12, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void adminAdjusted_twoEvents_recordUnchanged() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), true);
        saveEvent(TEST_DATE.atTime(8, 0));
        saveEvent(TEST_DATE.atTime(18, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(1, records.size());
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void adminAdjusted_singleEvent_recordUnchanged() {
        saveExistingRecord(LocalTime.of(9, 0), LocalTime.of(17, 0), true);
        saveEvent(TEST_DATE.atTime(8, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> records = recordsForDate(TEST_DATE);
        assertEquals(LocalTime.of(9, 0), records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), records.getFirst().getClockOutTime());
    }

    @Test
    void eventsDeletedAfterProcessing() {
        saveEvent(TEST_DATE.atTime(9, 0));
        saveEvent(TEST_DATE.atTime(17, 0));

        attendanceSchedule.generateDailyClockInEvents();

        assertTrue(clockInEventRepository.findAll().isEmpty());
    }

    @Test
    void noEvents_noRecordCreated() {
        assertDoesNotThrow(() -> attendanceSchedule.generateDailyClockInEvents());
        assertTrue(clockInRepository.findAll().isEmpty());
    }

    @Test
    void multipleEmployees_eventsProcessedIndependently() {
        AccountTable secondEmployee = new AccountTable();
        secondEmployee.setFirstName("John");
        secondEmployee.setLastName("Doe");
        secondEmployee.setUsername("johnd1");
        secondEmployee.setEmail("johnd15@test.com");
        secondEmployee.setPassword(BCrypt.hashpw("hashedPassword", BCrypt.gensalt()));
        secondEmployee.setMobilePin(BCrypt.hashpw("123456", BCrypt.gensalt()));
        secondEmployee.setTwoFactorSecret("NGXEIJWEXZ7NLRKF3P7VMRQMQ4GAT65Y");
        secondEmployee.setAddressOne("123 Main St");
        secondEmployee.setPostalCode("12345");
        secondEmployee.setBleSignature(UUID.fromString("cfeea6fd-6faf-4e96-9bb3-4bd5a8eb67e0"));
        accountRepository.save(secondEmployee);

        saveEvent(employee, TEST_DATE.atTime(9, 0));
        saveEvent(employee, TEST_DATE.atTime(17, 0));
        saveEvent(secondEmployee, TEST_DATE.atTime(8, 0));
        saveEvent(secondEmployee, TEST_DATE.atTime(16, 0));

        attendanceSchedule.generateDailyClockInEvents();

        List<ClockInTable> emp1Records = recordsForEmployeeAndDate(employee, TEST_DATE);
        List<ClockInTable> emp2Records = recordsForEmployeeAndDate(secondEmployee, TEST_DATE);

        assertEquals(LocalTime.of(9, 0), emp1Records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(17, 0), emp1Records.getFirst().getClockOutTime());
        assertEquals(LocalTime.of(8, 0), emp2Records.getFirst().getClockInTime());
        assertEquals(LocalTime.of(16, 0), emp2Records.getFirst().getClockOutTime());
    }

    @Test
    void multipleDates_allProcessed() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate twoDaysAgo = LocalDate.now().minusDays(2);

        saveEvent(employee, yesterday.atTime(9, 0));
        saveEvent(employee, yesterday.atTime(17, 0));
        saveEvent(employee, twoDaysAgo.atTime(8, 0));
        saveEvent(employee, twoDaysAgo.atTime(16, 0));

        attendanceSchedule.generateDailyClockInEvents();

        assertEquals(1, recordsForEmployeeAndDate(employee, yesterday).size());
        assertEquals(1, recordsForEmployeeAndDate(employee, twoDaysAgo).size());
        assertTrue(clockInEventRepository.findAll().isEmpty());
    }

    private void saveEvent(LocalDateTime time) {
        saveEvent(employee, time);
    }

    private void saveEvent(AccountTable account, LocalDateTime time) {
        ClockInEventTable event = new ClockInEventTable();
        event.setAccount(account);
        event.setCreated(time);
        clockInEventRepository.save(event);
    }

    private void saveExistingRecord(LocalTime clockIn, LocalTime clockOut, boolean adminAdjusted) {
        ClockInTable clock = new ClockInTable();
        clock.setAccount(employee);
        clock.setClockInTime(clockIn);
        clock.setClockOutTime(clockOut);
        clock.setCreated(TEST_DATE.atTime(clockIn));
        clock.setAdminAdjusted(adminAdjusted);
        clockInRepository.save(clock);
    }

    private List<ClockInTable> recordsForDate(LocalDate date) {
        return clockInRepository.findAllForEmployeeWithinDateRange(
                employee.getAccountId(),
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay()
        );
    }

    private List<ClockInTable> recordsForEmployeeAndDate(AccountTable account, LocalDate date) {
        return clockInRepository.findAllForEmployeeWithinDateRange(
                account.getAccountId(),
                date.atStartOfDay(),
                date.plusDays(1).atStartOfDay()
        );
    }
}