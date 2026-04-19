package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.AttendanceService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.SessionRepository;

import java.time.Clock;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@ActiveProfiles("test")
@Transactional
public class AttendanceControllerTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Mock
    private AttendanceService attendanceService;

    @InjectMocks
    private AttendanceController attendanceController;

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void setup() throws Exception {
        // Create account
        AccountTable account = new AccountTable();
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

        // Get the saved account to ensure we have the generated ID
        account = accountRepository.findByUsername("johnd18").orElseThrow();

        SessionTable valid = new SessionTable();
        valid.setAccount(account);
        valid.setRefreshToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");
        valid.setExpires(LocalDateTime.now(Clock.systemUTC()).plusHours(2));
        valid.setMobile(false);
        valid.setTwoFactor(true);
        sessionRepository.save(valid);

        MockHttpServletResponse response = mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "87cc6b24-d1aa-468a-bc98-ad1a902c8b3e")))
                .andReturn()
                .getResponse();

        if (response.getStatus() != 200) {
            throw new IllegalStateException(
                    "Expected 200 but got " + response.getStatus()
            );
        }

        String body = response.getContentAsString();

        if (body.isBlank()) {
            throw new IllegalStateException("Response body was empty");
        }

        accessToken = new ObjectMapper()
                .readTree(body)
                .path("accessToken")
                .asString();
    }

    @Test
    void testGetBleSignatureSuccess() throws Exception {
        // perform a GET to /api/attendance/signature with an Authorization header
        mockMvc.perform(get("/api/attendance/signature")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "0")
    void testGetBleSignatureAuthenticatedUserNotFound() throws Exception {
        mockMvc.perform(get("/api/attendance/signature")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetBleSignatureThrowsException() throws Exception {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(attendanceController).build();

        // simulate the AttendanceService throwing an exception
        when(attendanceService.getBleSignature())
                .thenThrow(new RuntimeException("Service failed"));

        // perform a POST to /auth/mfa/authorise with an Authorization header
        mockMvc.perform(get("/api/attendance/signature")
                        .header("Authorization", "Bearer " + accessToken)
                        .cookie(new Cookie("refreshToken", "doesnotexist")))
                .andExpect(status().isInternalServerError()) // matches ResponseStatusException
                .andExpect(result -> assertInstanceOf(ResponseStatusException.class, result.getResolvedException()))
                .andExpect(result -> {
                    ResponseStatusException ex = (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("Internal sever error", ex.getReason()); // match your controller message
                });
    }
}
