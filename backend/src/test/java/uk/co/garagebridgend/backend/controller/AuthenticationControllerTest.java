package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.AuthenticationService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;
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
        account.setPassword("hashedPassword");
        account.setSalt("1234567890123456");
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

    @Test
    void testNoRefreshToken() throws Exception {
        mockMvc.perform(get("/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenExpired() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "7ba4f287-5940-404e-9a54-f360a0f29eff")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenInvalid() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "invalid-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenValid() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "87cc6b24-d1aa-468a-bc98-ad1a902c8b3e")))
                .andExpect(status().isOk());
    }

    @Test
    void testRefreshTokenThrowsException() throws Exception {
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