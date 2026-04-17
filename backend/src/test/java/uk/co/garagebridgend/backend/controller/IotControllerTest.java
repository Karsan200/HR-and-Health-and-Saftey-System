package uk.co.garagebridgend.backend.controller;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.IotService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.IotDeviceTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInEventRepository;
import uk.co.garagebridgend.backend.repository.IotDeviceRepository;

import java.util.UUID;

import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
public class IotControllerTest {
    @Autowired
    private IotDeviceRepository iotDeviceRepository;

    @Autowired
    private ClockInEventRepository clockInEventRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Mock
    private IotService IotService;

    @InjectMocks
    private IotController IotController;

    @Autowired
    private MockMvc mockMvc;

    private UUID deviceId;

    private UUID accountBleId;

    @BeforeEach
    public void setUp() {
        // Clear the repository before each test to ensure a clean state
        iotDeviceRepository.deleteAll();

        // Add a device to the repository for testing purposes
        var device = new IotDeviceTable();
        device.setAccessToken(BCrypt.hashpw("123456", BCrypt.gensalt()));
        iotDeviceRepository.save(device);

        deviceId = device.getDeviceId();

        // Create an account
        var account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");
        account.setUsername("johnd18");
        account.setEmail("johnd@test.com");
        account.setPassword(BCrypt.hashpw("hashedPassword", BCrypt.gensalt()));
        account.setMobilePin(BCrypt.hashpw("123456", BCrypt.gensalt()));
        account.setTwoFactorSecret("NGXEIJWEXZ7NLRKF3P7VMRQMQ4GAT65Y");
        account.setAddressOne("123 Main St");
        account.setPostalCode("12345");
        accountRepository.save(account);

        accountBleId = account.getBleSignature();
    }

    @Test
    public void testUploadAttendanceSuccess() throws Exception {
        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", deviceId)
                        .header("X-Device-Token", "123456")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s", "%s"],
                        "timestamp": "2026-04-13T14:30:00"
                    }""".formatted(UUID.randomUUID(), UUID.randomUUID()))).andExpect(status().isOk());
    }

    @Test
    public void testUploadOldAttendanceData() throws Exception {
        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", deviceId)
                        .header("X-Device-Token", "123456")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s"],
                        "timestamp": "2020-01-01T00:00:00"
                    }""".formatted(accountBleId))).andExpect(status().isOk());

        // Verify that no clock-in event was created for the old timestamp
        var events = clockInEventRepository.findAll();
        Assertions.assertTrue(events.isEmpty(), "Expected no clock-in events to be created for old attendance data");
    }

    @Test
    public void testUploadDuplicateAttendanceData() throws Exception {
        String timestamp = "2026-04-13T14:30:00";

        // First upload should succeed
        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", deviceId)
                        .header("X-Device-Token", "123456")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s"],
                        "timestamp": "%s"
                    }""".formatted(accountBleId, timestamp))).andExpect(status().isOk());

        var expect = clockInEventRepository.findAll().size();

        // Second upload with the same timestamp should also succeed but not create a duplicate event
        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", deviceId)
                        .header("X-Device-Token", "123456")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s"],
                        "timestamp": "%s"
                    }""".formatted(accountBleId, timestamp))).andExpect(status().isOk());

        // Verify that only one clock-in event was created for the duplicate timestamp
        var events = clockInEventRepository.findAll();
        Assertions.assertEquals(expect, events.size(), "Expected only one clock-in event to be created for duplicate attendance data");
    }

    @Test
    public void testUploadAttendanceInvalidDevice() throws Exception {
        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", UUID.randomUUID())
                        .header("X-Device-Token", "invalid-token")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s"],
                        "timestamp": "2026-04-13T14:30:00"
                    }""".formatted(UUID.randomUUID()))).andExpect(status().isUnauthorized());
    }

    @Test
    public void testUploadAttendanceInvalidToken() throws Exception {
        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", deviceId)
                        .header("X-Device-Token", "invalid-token")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s"],
                        "timestamp": "2026-04-13T14:30:00"
                    }""".formatted(UUID.randomUUID()))).andExpect(status().isUnauthorized());
    }

    @Test
    public void testUploadAttendanceThrowsException() throws Exception {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(IotController).build();

        // simulate your IotService throwing an exception
        doThrow(new RuntimeException("Service failed"))
                .when(IotService).authorise(deviceId, "123456");

        mockMvc.perform(post("/api/iot/attendance/upload")
                        .header("X-Device-Id", deviceId)
                        .header("X-Device-Token", "123456")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "signatures": ["%s"],
                        "timestamp": "2026-04-13T14:30:00"
                    }""".formatted(UUID.randomUUID()))).andExpect(status().isInternalServerError());
    }
}
