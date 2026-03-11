package uk.co.garagebridgend.backend.controller;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.RentATechApplication;
import uk.co.garagebridgend.backend.logic.HsOverviewService;
import uk.co.garagebridgend.backend.models.entity.*;
import uk.co.garagebridgend.backend.repository.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the HS Overview controller endpoint.
 *
 * This test class prepares a small in-memory dataset (accounts, files,
 * documents, hazards and signatures) and verifies the JSON response from
 * the /hs-overview endpoint under different authentication scenarios.
 */
@SpringBootTest(
        classes = RentATechApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class HsOverviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private HazardRepository hazardRepository;

    @Autowired
    private SignatureRepository signatureRepository;

    @Autowired
    private FilesRepository filesRepository;

    @Mock
    private HsOverviewService hsOverviewService;

    @InjectMocks
    private HsOverviewController hsOverviewController;

    /**
     * Prepare a small dataset used by the tests. Clears repositories then creates
     * an account, a file, two documents, two hazards and a single signature.
     *
     * This method runs before each test to ensure a consistent starting state.
     */
    @BeforeEach
    void setup() {

        // Create test user
        AccountTable user = new AccountTable();
        user.setFirstName("Maggie");
        user.setLastName("May");
        user.setUsername("MMays");
        user.setEmail("mmays@test.com");
        user.setPassword(BCrypt.hashpw("password", BCrypt.gensalt()));
        user.setAddressOne("Test Street");
        user.setPostalCode("CF31");

        accountRepository.save(user);

        // Create file
        FilesTable file = new FilesTable();
        file.setAccount(user);
        file.setCreatedBy(user);
        file.setName("safety_policy");
        file.setExtension("pdf");

        filesRepository.save(file);

        // Documents
        DocumentTable doc1 = new DocumentTable();
        doc1.setTitle("Safety Policy");
        doc1.setFile(file);

        documentRepository.save(doc1);

        DocumentTable doc2 = new DocumentTable();
        doc2.setTitle("Fire Safety");
        doc2.setFile(file);

        documentRepository.save(doc2);

        // Hazards
        HazardTable hazard1 = new HazardTable();
        hazard1.setAccount(user);
        hazard1.setTitle("Loose Cable");
        hazard1.setQuestionOne("Cable across the floor");
        hazard1.setQuestionTwo("Office");
        hazard1.setQuestionThree("Trip risk");
        hazard1.setQuestionFour("Flood");
        hazard1.setQuestionFive("Low");
        hazard1.setQuestionSix("Fix soon");

        hazardRepository.save(hazard1);

        HazardTable hazard2 = new HazardTable();
        hazard2.setAccount(user);
        hazard2.setTitle("Wet Floor");
        hazard2.setQuestionOne("Cable across the floor");
        hazard2.setQuestionTwo("Office");
        hazard2.setQuestionThree("Trip risk");
        hazard2.setQuestionFour("Flood");
        hazard2.setQuestionFive("Low");
        hazard2.setQuestionSix("Fix soon");

        hazardRepository.save(hazard2);

        // Signature (user signed one document)
        SignatureTable signature = new SignatureTable();
        signature.setAccount(user);
        signature.setDocument(doc1);

        signatureRepository.save(signature);
    }

    /**
     * Happy-path: authenticated user with existing account should receive the
     * overview JSON containing counts for pending docs, signed docs and hazards.
     *
     * @throws Exception if the request or assertions fail
     */
    @Test
    @WithMockUser(username = "3")
    @Order(1)
    void testHsOverviewSuccess() throws Exception {

        mockMvc.perform(get("/api/hs-overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pendingDocs").value(2))
                .andExpect(jsonPath("$.signed").value(1))
                .andExpect(jsonPath("$.hazards").value(2));
    }

    /**
     * When authenticated as an unknown user the endpoint should return 404 Not Found.
     *
     * @throws Exception if the request or assertions fail
     */
    @Test
    @WithMockUser(username = "60")
    @Order(2)
    void testHsOverviewUserNotFound() throws Exception {

        mockMvc.perform(get("/api/hs-overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    void testOverviewThrowsException() throws Exception {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(hsOverviewController).build();

        // simulate your AuthenticationService throwing an exception
        when(hsOverviewService.getOverview())
                .thenThrow(new RuntimeException("Service failed"));

        // perform a GET to /auth/refresh with a cookie
        mockMvc.perform(get("/api/hs-overview"))
                .andExpect(status().isInternalServerError()) // matches ResponseStatusException
                .andExpect(result -> assertInstanceOf(ResponseStatusException.class, result.getResolvedException()))
                .andExpect(result -> {
                    ResponseStatusException ex = (ResponseStatusException) result.getResolvedException();
                    assertNotNull(ex);
                    assertEquals("Internal sever error", ex.getReason()); // match your controller message
                });
    }
}
