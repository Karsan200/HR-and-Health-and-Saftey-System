package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.*;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.HazardReportResponse;
import uk.co.garagebridgend.backend.models.response.HazardResponse;
import uk.co.garagebridgend.backend.models.response.RiskAssessmentResponse;
import uk.co.garagebridgend.backend.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class RiskAssessmentServiceTest {

    @Mock
    private RiskAssessmentRepository riskAssessmentRepository;

    @Mock
    private RiskAssessmentHazardRepository riskAssessmentHazardRepository;

    @Mock
    private HazardRepository hazardRepository;

    @Mock
    private HazardFilesRepository hazardFilesRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private RiskAssessmentService riskAssessmentService;


    @Test
    void testGetAllRiskAssessmentsSuccess() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);
        ra.setTitle("Fire Safety");
        ra.setCreated(LocalDateTime.now());

        HazardTable hazard = new HazardTable();
        hazard.setDraft(false);
        hazard.setAccount(account);

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(hazard);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentRepository.findAll()).thenReturn(List.of(ra));
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<RiskAssessmentResponse> result = riskAssessmentService.getAllRiskAssessments();

        assertEquals(1, result.size());
        assertEquals("Fire Safety", result.get(0).getTitle());
        assertEquals(1, result.get(0).getHazardCount());
        assertEquals(1, result.get(0).getActiveHazardCount());
        assertFalse(result.get(0).isHasDrafts());
    }

    @Test
    void testGetAllRiskAssessmentsHasDraftsForCurrentUser() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);
        ra.setTitle("Chemical Handling");
        ra.setCreated(LocalDateTime.now());

        HazardTable draftHazard = new HazardTable();
        draftHazard.setDraft(true);
        draftHazard.setAccount(account);

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(draftHazard);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentRepository.findAll()).thenReturn(List.of(ra));
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<RiskAssessmentResponse> result = riskAssessmentService.getAllRiskAssessments();

        assertTrue(result.get(0).isHasDrafts());
    }

    @Test
    void testGetAllRiskAssessmentsDoesNotFlagDraftsFromOtherUsers() {
        AccountTable currentUser = new AccountTable();
        currentUser.setAccountId(1L);

        AccountTable otherUser = new AccountTable();
        otherUser.setAccountId(2L);

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);
        ra.setTitle("Manual Handling");
        ra.setCreated(LocalDateTime.now());

        HazardTable draftByOther = new HazardTable();
        draftByOther.setDraft(true);
        draftByOther.setAccount(otherUser);

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(draftByOther);

        when(authenticationService.getCurrentUser()).thenReturn(currentUser);
        when(riskAssessmentRepository.findAll()).thenReturn(List.of(ra));
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<RiskAssessmentResponse> result = riskAssessmentService.getAllRiskAssessments();

        assertFalse(result.get(0).isHasDrafts());
    }

    @Test
    void testGetAllRiskAssessmentsReturnsEmptyList() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentRepository.findAll()).thenReturn(List.of());

        List<RiskAssessmentResponse> result = riskAssessmentService.getAllRiskAssessments();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetAllRiskAssessmentsUserNotAuthenticated() {
        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> riskAssessmentService.getAllRiskAssessments()
        );
    }

    // -------------------------------------------------------------------------
    // getHazardsForRiskAssessment()
    // -------------------------------------------------------------------------

    @Test
    void testGetHazardsForRiskAssessmentSuccess() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);

        HazardTable hazard = new HazardTable();
        hazard.setHazardId(10L);
        hazard.setTitle("Slippery Floor");
        hazard.setDraft(false);
        hazard.setAccount(account);
        hazard.setCreated(LocalDateTime.now());
        hazard.setActionComplete(null);

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(hazard);

        when(riskAssessmentRepository.findById(1L)).thenReturn(Optional.of(ra));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<HazardResponse> result = riskAssessmentService.getHazardsForRiskAssessment(1L);

        assertEquals(1, result.size());
        assertEquals("Slippery Floor", result.get(0).getTitle());
        assertEquals("John Doe", result.get(0).getCreatedBy());
        assertFalse(result.get(0).isClosed());
        assertTrue(result.get(0).isOwnedByCurrentUser());
    }

    @Test
    void testGetHazardsHidesDraftsFromOtherUsers() {
        AccountTable currentUser = new AccountTable();
        currentUser.setAccountId(1L);

        AccountTable otherUser = new AccountTable();
        otherUser.setAccountId(2L);
        otherUser.setFirstName("Jane");
        otherUser.setLastName("Smith");

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);

        HazardTable draftByOther = new HazardTable();
        draftByOther.setHazardId(20L);
        draftByOther.setTitle("Draft by someone else");
        draftByOther.setDraft(true);
        draftByOther.setAccount(otherUser);
        draftByOther.setCreated(LocalDateTime.now());

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(draftByOther);

        when(riskAssessmentRepository.findById(1L)).thenReturn(Optional.of(ra));
        when(authenticationService.getCurrentUser()).thenReturn(currentUser);
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<HazardResponse> result = riskAssessmentService.getHazardsForRiskAssessment(1L);

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetHazardsShowsOwnDrafts() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);

        HazardTable ownDraft = new HazardTable();
        ownDraft.setHazardId(30L);
        ownDraft.setTitle("My Draft");
        ownDraft.setDraft(true);
        ownDraft.setAccount(account);
        ownDraft.setCreated(LocalDateTime.now());
        ownDraft.setActionComplete(null);

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(ownDraft);

        when(riskAssessmentRepository.findById(1L)).thenReturn(Optional.of(ra));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<HazardResponse> result = riskAssessmentService.getHazardsForRiskAssessment(1L);

        assertEquals(1, result.size());
        assertTrue(result.get(0).isDraft());
        assertTrue(result.get(0).isOwnedByCurrentUser());
    }

    @Test
    void testGetHazardsClosedWhenActionCompleteIsSet() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);

        HazardTable closedHazard = new HazardTable();
        closedHazard.setHazardId(40L);
        closedHazard.setTitle("Resolved Hazard");
        closedHazard.setDraft(false);
        closedHazard.setAccount(account);
        closedHazard.setCreated(LocalDateTime.now());
        closedHazard.setActionComplete(LocalDateTime.now());

        RiskAssessmentHazardTable join = new RiskAssessmentHazardTable();
        join.setHazard(closedHazard);

        when(riskAssessmentRepository.findById(1L)).thenReturn(Optional.of(ra));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join));

        List<HazardResponse> result = riskAssessmentService.getHazardsForRiskAssessment(1L);

        assertTrue(result.get(0).isClosed());
    }

    @Test
    void testGetHazardsForRiskAssessmentNotFound() {
        when(riskAssessmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                NoSuchElementException.class,
                () -> riskAssessmentService.getHazardsForRiskAssessment(99L)
        );
    }

    // -------------------------------------------------------------------------
    // getHazardById()
    // -------------------------------------------------------------------------

    @Test
    void testGetHazardByIdSuccess() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("Jane");
        account.setLastName("Smith");

        FilesTable file = new FilesTable();
        file.setFileId(UUID.randomUUID());

        HazardFilesTable hazardFile = new HazardFilesTable();
        hazardFile.setFile(file);

        HazardTable hazard = new HazardTable();
        hazard.setHazardId(1L);
        hazard.setTitle("Gas Leak");
        hazard.setQuestionOne("What is the hazard?");
        hazard.setQuestionTwo("Who is affected?");
        hazard.setQuestionThree("Controls in place");
        hazard.setQuestionFour("Further actions");
        hazard.setQuestionFive("Responsible person");
        hazard.setQuestionSix(LocalDateTime.now());
        hazard.setDraft(false);
        hazard.setActionComplete(null);
        hazard.setAccount(account);
        hazard.setCreated(LocalDateTime.now());

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(hazard));
        when(hazardFilesRepository.findByHazard(hazard)).thenReturn(List.of(hazardFile));
        when(storageService.getPresignedUrl(any())).thenReturn("https://example.com/file.jpg");

        HazardReportResponse result = riskAssessmentService.getHazardById(1L);

        assertEquals(1L, result.getHazardId());
        assertEquals("Gas Leak", result.getTitle());
        assertEquals("Jane Smith", result.getCreatedBy());
        assertFalse(result.isClosed());
        assertFalse(result.isDraft());
        assertEquals(1, result.getFileUrls().size());
        assertEquals("https://example.com/file.jpg", result.getFileUrls().get(0));
    }

    @Test
    void testGetHazardByIdClosedWhenActionCompleteIsSet() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("Jane");
        account.setLastName("Smith");

        HazardTable hazard = new HazardTable();
        hazard.setHazardId(2L);
        hazard.setTitle("Closed Hazard");
        hazard.setAccount(account);
        hazard.setActionComplete(LocalDateTime.now());
        hazard.setCreated(LocalDateTime.now());

        when(hazardRepository.findById(2L)).thenReturn(Optional.of(hazard));
        when(hazardFilesRepository.findByHazard(hazard)).thenReturn(List.of());

        HazardReportResponse result = riskAssessmentService.getHazardById(2L);

        assertTrue(result.isClosed());
    }

    @Test
    void testGetHazardByIdNoFiles() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");

        HazardTable hazard = new HazardTable();
        hazard.setHazardId(3L);
        hazard.setTitle("No Files Hazard");
        hazard.setAccount(account);
        hazard.setActionComplete(null);
        hazard.setCreated(LocalDateTime.now());

        when(hazardRepository.findById(3L)).thenReturn(Optional.of(hazard));
        when(hazardFilesRepository.findByHazard(hazard)).thenReturn(List.of());

        HazardReportResponse result = riskAssessmentService.getHazardById(3L);

        assertNotNull(result.getFileUrls());
        assertTrue(result.getFileUrls().isEmpty());
    }

    @Test
    void testGetHazardByIdNotFound() {
        when(hazardRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                NoSuchElementException.class,
                () -> riskAssessmentService.getHazardById(99L)
        );
    }

    // -------------------------------------------------------------------------
    // getMyDraftHazards()
    // -------------------------------------------------------------------------

    @Test
    void testGetMyDraftHazardsSuccess() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");

        HazardTable draft = new HazardTable();
        draft.setHazardId(1L);
        draft.setTitle("My Draft Hazard");
        draft.setDraft(true);
        draft.setAccount(account);
        draft.setCreated(LocalDateTime.now());
        draft.setActionComplete(null);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(hazardRepository.findAll()).thenReturn(List.of(draft));

        List<HazardResponse> result = riskAssessmentService.getMyDraftHazards();

        assertEquals(1, result.size());
        assertEquals("My Draft Hazard", result.get(0).getTitle());
        assertTrue(result.get(0).isDraft());
        assertTrue(result.get(0).isOwnedByCurrentUser());
    }

    @Test
    void testGetMyDraftHazardsFiltersOutOtherUsersDrafts() {
        AccountTable currentUser = new AccountTable();
        currentUser.setAccountId(1L);

        AccountTable otherUser = new AccountTable();
        otherUser.setAccountId(2L);
        otherUser.setFirstName("Jane");
        otherUser.setLastName("Smith");

        HazardTable otherDraft = new HazardTable();
        otherDraft.setHazardId(5L);
        otherDraft.setTitle("Someone Else's Draft");
        otherDraft.setDraft(true);
        otherDraft.setAccount(otherUser);
        otherDraft.setCreated(LocalDateTime.now());

        when(authenticationService.getCurrentUser()).thenReturn(currentUser);
        when(hazardRepository.findAll()).thenReturn(List.of(otherDraft));

        List<HazardResponse> result = riskAssessmentService.getMyDraftHazards();

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetMyDraftHazardsFiltersOutPublishedHazards() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);
        account.setFirstName("John");
        account.setLastName("Doe");

        HazardTable published = new HazardTable();
        published.setHazardId(6L);
        published.setTitle("Published Hazard");
        published.setDraft(false);
        published.setAccount(account);
        published.setCreated(LocalDateTime.now());

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(hazardRepository.findAll()).thenReturn(List.of(published));

        List<HazardResponse> result = riskAssessmentService.getMyDraftHazards();

        assertTrue(result.isEmpty());
    }

    @Test
    void testGetMyDraftHazardsUserNotAuthenticated() {
        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> riskAssessmentService.getMyDraftHazards()
        );
    }

    // -------------------------------------------------------------------------
    // markActionComplete()
    // -------------------------------------------------------------------------

    @Test
    void testMarkActionCompleteSuccess() {
        HazardTable hazard = new HazardTable();
        hazard.setHazardId(1L);
        hazard.setActionComplete(null);

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(hazard));

        riskAssessmentService.markActionComplete(1L);

        assertNotNull(hazard.getActionComplete());
        verify(hazardRepository).save(hazard);
    }

    @Test
    void testMarkActionCompleteSetsTimestamp() {
        HazardTable hazard = new HazardTable();
        hazard.setHazardId(1L);
        hazard.setActionComplete(null);

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(hazard));

        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        riskAssessmentService.markActionComplete(1L);
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);

        assertTrue(hazard.getActionComplete().isAfter(before));
        assertTrue(hazard.getActionComplete().isBefore(after));
    }

    @Test
    void testMarkActionCompleteNotFound() {
        when(hazardRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                NoSuchElementException.class,
                () -> riskAssessmentService.markActionComplete(99L)
        );

        verify(hazardRepository, never()).save(any());
    }

    /**
     * Test that the active hazard count in the risk assessment response correctly excludes draft hazards,
     * while the total hazard count includes them. This ensures that the frontend can display both counts accurately.
     */
    @Test
    void testGetAllRiskAssessmentsActiveHazardCountExcludesDrafts() {
        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        RiskAssessmentTable ra = new RiskAssessmentTable();
        ra.setRiskAssessmentId(1L);
        ra.setTitle("Manual Handling");
        ra.setCreated(LocalDateTime.now());

        HazardTable activeHazard = new HazardTable();
        activeHazard.setDraft(false);
        activeHazard.setAccount(account);

        HazardTable draftHazard = new HazardTable();
        draftHazard.setDraft(true);
        draftHazard.setAccount(account);

        RiskAssessmentHazardTable join1 = new RiskAssessmentHazardTable();
        join1.setHazard(activeHazard);

        RiskAssessmentHazardTable join2 = new RiskAssessmentHazardTable();
        join2.setHazard(draftHazard);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(riskAssessmentRepository.findAll()).thenReturn(List.of(ra));
        when(riskAssessmentHazardRepository.findByRiskAssessment(ra)).thenReturn(List.of(join1, join2));

        List<RiskAssessmentResponse> result = riskAssessmentService.getAllRiskAssessments();

        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getHazardCount());      // includes draft
        assertEquals(1, result.get(0).getActiveHazardCount()); // excludes draft
    }
}