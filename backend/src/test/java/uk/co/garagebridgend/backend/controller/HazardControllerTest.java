package uk.co.garagebridgend.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.HazardService;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.SessionTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.SessionRepository;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
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
public class HazardControllerTest {
    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Mock
    private HazardService hazardService;

    @InjectMocks
    private HazardController hazardController;

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    private String getAccessToken() throws Exception {
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

        return new ObjectMapper()
                .readTree(body)
                .path("accessToken")
                .asString();
    }

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
        account.setAddressOne("123 Main St");
        account.setPostalCode("12345");
        accountRepository.save(account);

        // Create refresh token for account
        SessionTable valid = new SessionTable();
        valid.setAccount(account);
        valid.setRefreshToken("87cc6b24-d1aa-468a-bc98-ad1a902c8b3e");
        valid.setExpires(LocalDateTime.now(Clock.systemUTC()).plusHours(2));
        valid.setMobile(false);
        valid.setTwoFactor(false);
        sessionRepository.save(valid);

        // Get access token
        this.accessToken = this.getAccessToken();
    }

    @Test
    void testHazardFileTooLarge() throws Exception {
        String largeBase64 = Base64.getEncoder().encodeToString(new byte[1024 * 1024 * 13]); // 13MB

        mockMvc.perform(post("/api/hazard/report")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                {
                    "title": "Test",
                    "questionOne": "",
                    "questionTwo": "",
                    "questionThree": "",
                    "questionFour": "",
                    "questionFive": "",
                    "questionSix": "2026-03-16T12:00:00",
                    "isDraft": false,
                    "isCompleted": true,
                    "files": [{"name": "test", "extension": "png", "content": "%s"}]
                }""".formatted(largeBase64)))
                .andExpect(status().isBadRequest())
                .andExpect(result -> {
                    ResponseStatusException ex =
                            (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("File size exceeds the maximum limit.", ex.getReason());
                });
    }

    @Test
    @WithMockUser(username = "0")
    void testHazardReportUserNotFound() throws Exception {

        mockMvc.perform(post("/api/hazard/report")
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "title": "",
                        "questionOne": "",
                        "questionTwo": "",
                        "questionThree": "",
                        "questionFour": "",
                        "questionFive": "",
                        "questionSix": "2026-03-16T12:00:00",
                        "isDraft": false,
                        "isCompleted": true,
                        "files": []
                    }"""))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testReportThrowsException() throws Exception {
        mockMvc.perform(post("/api/hazard/report")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(String.valueOf(MediaType.APPLICATION_JSON))
                        .content("""
                    {
                        "title": "Test",
                        "questionOne": "",
                        "questionTwo": "",
                        "questionThree": "",
                        "questionFour": "",
                        "questionFive": "",
                        "questionSix": "2026-03-16T12:00:00",
                        "isDraft": false,
                        "isCompleted": true,
                        "files": [{"name": "test", "extension": "png", "content": "iVBORw0KGgo="}]
                    }"""))
                .andExpect(status().isInternalServerError())
                .andExpect(result -> {
                    ResponseStatusException ex =
                            (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("Internal sever error", ex.getReason());
                });
    }
}
