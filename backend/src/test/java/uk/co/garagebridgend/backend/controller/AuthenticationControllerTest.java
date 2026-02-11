package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.PermissionsTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.PermissionsRepository;
import uk.co.garagebridgend.backend.repository.SessionRepository;

import java.time.LocalDateTime;

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
        expired.setRefreshToken("expired-token");
        expired.setExpires(LocalDateTime.now().minusHours(1));
        expired.setMobile(false);
        expired.setTwoFactor(false);
        sessionRepository.save(expired);

        SessionTable valid = new SessionTable();
        valid.setAccount(account);
        valid.setRefreshToken("valid-token");
        valid.setExpires(LocalDateTime.now().plusHours(1));
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
                        .cookie(new Cookie("refreshToken", "expired-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenValid() throws Exception {
        mockMvc.perform(get("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "valid-token")))
                .andExpect(status().isOk());
    }
}