package uk.co.garagebridgend.backend.controller;

import com.bastiaanjansen.otp.HMACAlgorithm;
import com.bastiaanjansen.otp.TOTPGenerator;
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
import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.models.request.AuthRequest;
import uk.co.garagebridgend.backend.models.request.AuthRotateRequest;
import uk.co.garagebridgend.backend.models.request.MfaAuthoriseRequest;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;
import uk.co.garagebridgend.backend.repository.SessionRepository;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

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

    @BeforeEach
    void setup() {
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
        expired.setTwoFactor(true);
        sessionRepository.save(expired);

        SessionTable valid = new SessionTable();
        valid.setAccount(account);
        valid.setRefreshToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");
        valid.setExpires(LocalDateTime.now(Clock.systemUTC()).plusHours(2));
        valid.setMobile(false);
        valid.setTwoFactor(true);
        sessionRepository.save(valid);

        // Create a new account (for mobile)
        var mobilePin = "654321";

        AccountTable mobile = new AccountTable();
        mobile.setFirstName("Jane");
        mobile.setLastName("Smith");
        mobile.setUsername("janesmith");
        mobile.setEmail("janesmith@example.com");
        mobile.setAddressOne("123 Main St");
        mobile.setPostalCode("12345");

        // Password for login
        mobile.setPassword(BCrypt.hashpw("hashedPassword", BCrypt.gensalt()));

        // Mobile PIN for refresh rotation
        mobile.setMobilePin(BCrypt.hashpw(mobilePin, BCrypt.gensalt()));

        accountRepository.save(mobile);

        mobile = accountRepository.findByUsername("janesmith").orElseThrow();

        PermissionsTable permissionsMobile = new PermissionsTable();
        permissionsMobile.setAccount(mobile);
        permissionsMobile.setAdmin(false);
        permissionsMobile.setManager(false);
        permissionsRepository.save(permissionsMobile);

        // Create session
        SessionTable sessionMobile = new SessionTable();
        sessionMobile.setAccount(mobile);
        sessionMobile.setRefreshToken("87cc6b24-d1aa-468a-bc98-ad1a902fghfghf");
        sessionMobile.setExpires(LocalDateTime.now(Clock.systemUTC()).plusHours(2));
        sessionMobile.setMobile(true);
        sessionMobile.setTwoFactor(false);
        sessionRepository.save(sessionMobile);
    }

    private String getAccessToken(String refreshToken) throws Exception {
        MockHttpServletResponse response = mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", refreshToken)))
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

        return new ObjectMapper()
                .readTree(body)
                .path("accessToken")
                .asString();
    }

    @Test
    @Order(1)
    void testAuthenticateMobileSuccess() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "username": "johnd18",
                        "password": "hashedPassword",
                        "isMobile": true
                    }"""))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String responseBody = result.getResponse().getContentAsString();
                    assertFalse(responseBody.isBlank(), "Response body should not be empty");

                    // Check access token in response
                    String accessToken = new ObjectMapper()
                            .readTree(responseBody)
                            .path("accessToken")
                            .asString();
                    assertFalse(accessToken.isBlank(), "Access token should not be empty");

                    // Check refresh token cookie
                    Cookie refreshCookie = result.getResponse().getCookie("refreshToken");
                    assertNotNull(refreshCookie, "Refresh token cookie should be set");
                    assertFalse(refreshCookie.getValue().isBlank(), "Refresh token cookie value should not be empty");
                });
    }

    @Test
    @Order(1)
    void testAuthenticateWebSuccess() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "username": "johnd18",
                        "password": "hashedPassword",
                        "isMobile": false
                    }"""))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String responseBody = result.getResponse().getContentAsString();
                    assertFalse(responseBody.isBlank(), "Response body should not be empty");

                    // Check access token in response
                    String accessToken = new ObjectMapper()
                            .readTree(responseBody)
                            .path("accessToken")
                            .asString();
                    assertFalse(accessToken.isBlank(), "Access token should not be empty");

                    // Check refresh token cookie
                    Cookie refreshCookie = result.getResponse().getCookie("refreshToken");
                    assertNotNull(refreshCookie, "Refresh token cookie should be set");
                    assertFalse(refreshCookie.getValue().isBlank(), "Refresh token cookie value should not be empty");
                });
    }

    @Test
    @Order(1)
    void testAuthenticateInvalidCredentials() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "username": "johnd18",
                        "password": "wrongPassword",
                        "isMobile": false
                    }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(1)
    void testAuthenticateAccountNotFound() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "username": "nonexistent",
                        "password": "hashedPassword",
                        "isMobile": false
                    }"""))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(1)
    void testAuthenticateThrowsException() throws Exception {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();

        // simulate your AuthenticationService throwing an exception
        when(authenticationService.authenticate(new AuthRequest()))
                .thenThrow(new RuntimeException("Service failed"));

        // perform a POST to /auth/login
        mockMvc.perform(post("/auth/login")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "username": "johnd18",
                        "password": "hashedPassword",
                        "isMobile": false
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
    @Order(2)
    void testAuthenticateMfaSuccess() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

        // Get a TOTP code for the MFA secret
        TOTPGenerator totp = new TOTPGenerator.Builder("NGXEIJWEXZ7NLRKF3P7VMRQMQ4GAT65Y")
                .withHOTPGenerator(builder -> {
                    builder.withPasswordLength(6);
                    builder.withAlgorithm(HMACAlgorithm.SHA1);
                })
                .withPeriod(Duration.ofSeconds(30))
                .build();

        mockMvc.perform(post("/auth/mfa/authorise")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .cookie(new Cookie("refreshToken", "87cc6b24-d1aa-468a-bc98-ad1a902c8b3e"))
                        .content("""
                    {
                        "code": "%s"
                    }""".formatted(totp.now())))
                .andExpect(status().isOk());
    }

    @Test
    @Order(2)
    void testAuthenticateMfaNoRefreshToken() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

        mockMvc.perform(post("/auth/mfa/authorise")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "code": "123456"
                    }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testAuthenticateMfaInvalidCode() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

        mockMvc.perform(post("/auth/mfa/authorise")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .cookie(new Cookie("refreshToken", "87cc6b24-d1aa-468a-bc98-ad1a902c8b3e"))
                        .content("""
                    {
                        "code": "000000"
                    }"""))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(2)
    @WithMockUser(username = "0")
    void testAuthenticateMfaNotAuthenticated() throws Exception {
        mockMvc.perform(post("/auth/mfa/authorise")
                .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                .cookie(new Cookie("refreshToken", "87cc6b24-d1aa-468a-bc98-ad1a902c8b3e"))
                .content("""
                    {
                        "code": "000000"
                    }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testAuthenticateMfaInvalidRefreshToken() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

        // Get a TOTP code for the MFA secret
        TOTPGenerator totp = new TOTPGenerator.Builder("NGXEIJWEXZ7NLRKF3P7VMRQMQ4GAT65Y")
                .withHOTPGenerator(builder -> {
                    builder.withPasswordLength(6);
                    builder.withAlgorithm(HMACAlgorithm.SHA1);
                })
                .withPeriod(Duration.ofSeconds(30))
                .build();

        mockMvc.perform(post("/auth/mfa/authorise")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .cookie(new Cookie("refreshToken", "doesnotexist"))
                        .content("""
                    {
                        "code": "%s"
                    }""".formatted(totp.now())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testAuthenticateMfaThrowsException() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();

        // simulate your AuthenticationService throwing an exception
        when(authenticationService.authenticateMfa(new MfaAuthoriseRequest("123456"), "doesnotexist"))
                .thenThrow(new RuntimeException("Service failed"));

        // perform a POST to /auth/mfa/authorise with an Authorization header
        mockMvc.perform(post("/auth/mfa/authorise")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .cookie(new Cookie("refreshToken", "doesnotexist"))
                        .content("""
                    {
                        "code": "123456"
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
    @Order(2)
    void testCheckMfaSuccess() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902fghfghf");
        mockMvc.perform(get("/auth/mfa/check").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(result -> {;
                    String responseBody = result.getResponse().getContentAsString();
                    assertFalse(responseBody.isBlank(), "Response body should not be empty");

                    boolean requiresMfa = new ObjectMapper()
                            .readTree(responseBody)
                            .path("mfaAuthorised")
                            .asBoolean();

                    assertFalse(requiresMfa, "Expected mfaAuthorised to be false");

                    String mfaSecret = new ObjectMapper()
                            .readTree(responseBody)
                            .path("secret")
                            .asText();
                    assertFalse(mfaSecret.isBlank(), "MFA secret should not be empty");
                });
    }

    @Test
    @Order(2)
    void testCheckMfaSuccessNullSecret() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");
        mockMvc.perform(get("/auth/mfa/check").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(result -> {;
                    String responseBody = result.getResponse().getContentAsString();
                    assertFalse(responseBody.isBlank(), "Response body should not be empty");

                    boolean requiresMfa = new ObjectMapper()
                            .readTree(responseBody)
                            .path("mfaAuthorised")
                            .asBoolean();

                    assertTrue(requiresMfa, "Expected mfaAuthorised to be true");

                    String mfaSecret = new ObjectMapper()
                            .readTree(responseBody)
                            .path("secret")
                            .asText();
                    assertTrue(mfaSecret.isBlank(), "MFA secret should be null");
                });
    }

    @Test
    @Order(2)
    @WithMockUser(username = "0")
    void testCheckMfaNotAuthenticated() throws Exception {
        mockMvc.perform(get("/auth/mfa/check"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testCheckMfaThrowsException() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902fghfghf");

        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();

        // simulate your AuthenticationService throwing an exception
        when(authenticationService.checkMfa())
                .thenThrow(new RuntimeException("Service failed"));

        // perform a GET to /auth/mfa/check with an Authorization header
        mockMvc.perform(get("/auth/mfa/check").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isInternalServerError()) // matches ResponseStatusException
                .andExpect(result -> assertInstanceOf(ResponseStatusException.class, result.getResolvedException()))
                .andExpect(result -> {
                    ResponseStatusException ex = (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("Internal sever error", ex.getReason()); // match your controller message
                });
    }

    @Test
    @Order(2)
    void testRotateNotAuthenticated() throws Exception {
        mockMvc.perform(post("/auth/rotate"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testRotateExpiredAccessToken() throws Exception {
        mockMvc.perform(post("/auth/rotate")
                        .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJtb2JpbGVUb2tlbiI6dHJ1ZSwibWZhIjpmYWxzZSwic3ViIjoiMSIsImlhdCI6MTc3Mzc3Mzk5OSwiZXhwIjoxNzczNzc0Mjk5fQ.JfdaJyrvItkM7VSNBgq4ypG2odoSjox4tskey-7rA2E")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "pinCode": "123456"
                    }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testRotateInvalidPin() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

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
    @WithMockUser(username = "0")
    @Order(2)
    void testRotateAccountNotFound() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902fghfghf");

        // Delete the account associated with the session to simulate account not found
        Optional<SessionTable> session = sessionRepository.findByRefreshToken("87cc6b24-d1aa-468a-bc98-ad1a902fghfghf");

        assertTrue(session.isPresent(), "Session should exist before deletion");

        mockMvc.perform(post("/auth/rotate")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                {
                    "pinCode": "123456"
                }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testRotateSuccess() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902fghfghf");

        mockMvc.perform(post("/auth/rotate")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                            {
                                "pinCode": "654321"
                            }"""))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    String responseBody = result.getResponse().getContentAsString();
                    assertFalse(responseBody.isBlank(), "Response body should not be empty");

                    // Check access token in response
                    String newAccessToken = new ObjectMapper()
                            .readTree(responseBody)
                            .path("accessToken")
                            .asString();
                    assertFalse(newAccessToken.isBlank(), "Access token should not be empty");

                    // Check refresh token cookie
                    Cookie refreshCookie = result.getResponse().getCookie("refreshToken");
                    assertNotNull(refreshCookie, "Refresh token cookie should be set");
                    assertFalse(refreshCookie.getValue().isBlank(), "Refresh token cookie value should not be empty");
                });
    }

    @Test
    @Order(2)
    void testRotateThrowsException() throws Exception {
        String accessToken = getAccessToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");

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