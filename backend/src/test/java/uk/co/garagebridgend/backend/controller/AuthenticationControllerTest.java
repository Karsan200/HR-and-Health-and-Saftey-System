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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.models.request.AuthRotateRequest;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;
import uk.co.garagebridgend.backend.repository.SessionRepository;

import java.time.Clock;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
public class AuthenticationControllerTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PermissionsRepository permissionsRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private AuthenticationController authenticationController;

    @Autowired
    private MockMvc mockMvc;

    private String accessToken = null;

    @BeforeEach
    void setup() {
        // Create salt
        String salt = BCrypt.gensalt();

        // Create account
        AccountTable account = new AccountTable();
        account.setFirstName("John");
        account.setLastName("Doe");
        account.setUsername("johnd18");
        account.setEmail("johnd@test.com");
        account.setPassword(BCrypt.hashpw("hashedPassword", salt));
        account.setSalt(salt);
        account.setMobilePin(BCrypt.hashpw("123456", salt));
        account.setMobilePinSalt(salt);
        accountRepository.save(account);

        // Get the saved account to ensure we have the generated ID
        account = accountRepository.findByUsername("johnd18").orElseThrow();

        // Permissions
        PermissionsTable permissions = new PermissionsTable();
        permissions.setAccount(account);
        permissions.setAdmin(true);
        permissions.setManager(true);
        permissionsRepository.save(permissions);

        // Sessions
        SessionTable expired = new SessionTable();
        expired.setAccount(account);
        expired.setRefreshToken("7ba4f287-5940-404e-9a54-f360a0f29eff");
        expired.setExpires(LocalDateTime.now(Clock.systemUTC()).minusHours(1));
        expired.setMobile(false);
        expired.setTwoFactor(false);
        sessionRepository.save(expired);

        SessionTable valid = new SessionTable();
        valid.setAccount(account);
        valid.setRefreshToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");
        valid.setExpires(LocalDateTime.now(Clock.systemUTC()).plusHours(2));
        valid.setMobile(false);
        valid.setTwoFactor(false);
        sessionRepository.save(valid);
    }

    private void setAccessToken() throws Exception {
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
    @Order(2)
    void testRotateNotAuthenticated() throws Exception {
        mockMvc.perform(post("/auth/rotate"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testRotateInvalidPin() throws Exception {
        if (accessToken == null) {
            setAccessToken();
        }

        mockMvc.perform(post("/auth/rotate")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "pinCode": "000000"
                    }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testRotateThrowsException() throws Exception {
        if (accessToken == null) {
            setAccessToken();
        }

        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();

        // simulate your AuthenticationService throwing an exception
        when(authenticationService.rotateRefreshToken(new AuthRotateRequest()))
                .thenThrow(new RuntimeException("Service failed"));

        // perform a POST to /auth/rotate with an Authorization header
        mockMvc.perform(post("/auth/rotate")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "pinCode": ""
                    }"""))
                .andExpect(status().isInternalServerError()) // matches ResponseStatusException
                .andExpect(result -> assertInstanceOf(ResponseStatusException.class, result.getResolvedException()))
                .andExpect(result -> {
                    ResponseStatusException ex = (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("Internal sever error", ex.getReason()); // match your controller message
                });
    }

    @Test
    @Order(1)
    void testNoRefreshToken() throws Exception {
        mockMvc.perform(get("/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(1)
    void testRefreshTokenExpired() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "7ba4f287-5940-404e-9a54-f360a0f29eff")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(1)
    void testRefreshTokenInvalid() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "invalid-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(1)
    void testRefreshTokenValid() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "87cc6b24-d1aa-468a-bc98-ad1a902c8b3e")))
                .andExpect(status().isOk());
    }

    @Test
    @Order(1)
    void testRefreshThrowsException() throws Exception {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();

        // simulate your AuthenticationService throwing an exception
        when(authenticationService.refreshAccessToken("87cc6b24"))
                .thenThrow(new RuntimeException("Service failed"));

        // perform a GET to /auth/refresh with a cookie
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "87cc6b24")))
                .andExpect(status().isInternalServerError()) // matches ResponseStatusException
                .andExpect(result -> assertInstanceOf(ResponseStatusException.class, result.getResolvedException()))
                .andExpect(result -> {
                    ResponseStatusException ex = (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("Internal sever error", ex.getReason()); // match your controller message
                });
    }


}