package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.controller.HazardController;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.entity.HazardFilesTable;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.FileUploadRequest;
import uk.co.garagebridgend.backend.models.request.HazardReportRequest;
import uk.co.garagebridgend.backend.repository.FilesRepository;
import uk.co.garagebridgend.backend.repository.HazardFilesRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class HazardServiceTest {

    @Mock
    private StorageService storageService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private HazardRepository hazardRepository;

    @Mock
    private HazardFilesRepository hazardFilesRepository;

    @Mock
    private FilesRepository filesRepository;

    @InjectMocks
    private HazardService hazardService;

    private final HazardService mockHazardService = mock(HazardService.class);
    private final HazardController hazardController = new HazardController(mockHazardService);

    private AccountTable account;
    private HazardTable existingHazard;
    private HazardReportRequest body;

    /**
     * Builds a {@link FileUploadRequest} whose decoded byte size equals
     * {@code sizeInKb} kilobytes, giving the service something concrete to measure.
     */
    private FileUploadRequest buildFile(final int sizeInKb) {
        byte[] raw = new byte[sizeInKb * 1024];
        FileUploadRequest file = new FileUploadRequest();
        file.setName("test-file");
        file.setExtension("jpg");
        file.setContent(Base64.getEncoder().encodeToString(raw));
        return file;
    }

    /** Returns a minimal valid {@link HazardReportRequest} with no files. */
    private HazardReportRequest buildBody() {
        HazardReportRequest req = new HazardReportRequest();
        req.setTitle("Updated Title");
        req.setQuestionOne("Q1");
        req.setQuestionTwo("Q2");
        req.setQuestionThree("Q3");
        req.setQuestionFour("Q4");
        req.setQuestionFive("Q5");
        req.setQuestionSix(LocalDateTime.of(2026, 3, 16, 12, 0));
        req.setDraft(false);
        req.setCompleted(false);
        req.setFiles(Collections.emptyList());
        return req;
    }

    @BeforeEach
    void setUp() {
        account = new AccountTable();
        account.setAccountId(1L);

        existingHazard = new HazardTable();
        existingHazard.setTitle("Original Title");

        body = buildBody();
    }

    /**
     * Tests that a {@link NoSuchElementException} is thrown when the hazard ID
     * does not exist, and that the repository save is never called.
     */
    @Test
    void testUpdateHazardNotFound() {
        when(hazardRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                NoSuchElementException.class,
                () -> hazardService.update(99L, body)
        );

        verify(hazardRepository, never()).save(any());
    }

    /**
     * Tests that an {@link IllegalArgumentException} is thrown when an uploaded
     * file exceeds the configured maximum size limit.
     */
    @Test
    void testUpdateFileTooLarge() throws AuthenticatedAccountNotFoundException {
        FileUploadRequest oversized = buildFile(2); // 2 KB file
        byte[] decoded = Base64.getDecoder().decode(oversized.getContent());

        body.setFiles(List.of(oversized));

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64(oversized.getContent())).thenReturn(decoded);
        when(storageService.getMaxFileSize()).thenReturn(1); // 1 KB limit

        assertThrows(
                IllegalArgumentException.class,
                () -> hazardService.update(1L, body)
        );

        verify(hazardRepository, never()).save(any());
    }

    /**
     * Tests that all hazard fields are correctly persisted when no files are
     * included in the request, and that no file-related calls are made.
     */
    @Test
    void testUpdateNoFilesUpdatesHazardFields() throws AuthenticatedAccountNotFoundException {
        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(hazardRepository.save(any())).thenReturn(existingHazard);

        hazardService.update(1L, body);

        ArgumentCaptor<HazardTable> captor = ArgumentCaptor.forClass(HazardTable.class);
        verify(hazardRepository).save(captor.capture());

        HazardTable saved = captor.getValue();
        assertEquals("Updated Title", saved.getTitle());
        assertEquals("Q1", saved.getQuestionOne());
        assertEquals("Q2", saved.getQuestionTwo());
        assertEquals("Q3", saved.getQuestionThree());
        assertEquals("Q4", saved.getQuestionFour());
        assertEquals("Q5", saved.getQuestionFive());
        assertFalse(saved.isDraft());

        verifyNoInteractions(filesRepository, hazardFilesRepository);
        verify(storageService, never()).uploadFile(anyString(), any(), anyString());
    }

    /**
     * Tests that {@code actionComplete} is set to a non-null value when the
     * {@code isCompleted} flag is true in the request body.
     */
    @Test
    void testUpdateCompletedSetsActionComplete() throws AuthenticatedAccountNotFoundException {
        body.setCompleted(true);

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(hazardRepository.save(any())).thenReturn(existingHazard);

        hazardService.update(1L, body);

        ArgumentCaptor<HazardTable> captor = ArgumentCaptor.forClass(HazardTable.class);
        verify(hazardRepository).save(captor.capture());

        assertNotNull(captor.getValue().getActionComplete());
    }

    /**
     * Tests that {@code actionComplete} is explicitly set to null when
     * {@code isCompleted} is false, even if it was previously set.
     */
    @Test
    void testUpdateNotCompletedClearsActionComplete() throws AuthenticatedAccountNotFoundException {
        existingHazard.setActionComplete(LocalDateTime.now()); // previously completed
        body.setCompleted(false);

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(hazardRepository.save(any())).thenReturn(existingHazard);

        hazardService.update(1L, body);

        ArgumentCaptor<HazardTable> captor = ArgumentCaptor.forClass(HazardTable.class);
        verify(hazardRepository).save(captor.capture());

        assertNull(captor.getValue().getActionComplete());
    }

    /**
     * Tests that a valid file is saved to the files repository, linked to the
     * hazard via the junction table, and uploaded to object storage.
     */
    @Test
    void testUpdateWithValidFileSavesAndUploads() throws AuthenticatedAccountNotFoundException {
        FileUploadRequest validFile = buildFile(1); // 1 KB — within the 2 KB limit
        byte[] decoded = Base64.getDecoder().decode(validFile.getContent());

        body.setFiles(List.of(validFile));

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64(validFile.getContent())).thenReturn(decoded);
        when(storageService.getMaxFileSize()).thenReturn(2); // 2 KB limit
        when(hazardRepository.save(any())).thenReturn(existingHazard);
        when(filesRepository.save(any(FilesTable.class))).thenAnswer(invocation -> {
            FilesTable fileArg = invocation.getArgument(0);
            fileArg.setFileId(UUID.randomUUID());
            return fileArg;
        });

        hazardService.update(1L, body);

        verify(filesRepository, times(1)).save(any(FilesTable.class));
        verify(hazardFilesRepository, times(1)).save(any(HazardFilesTable.class));
        verify(storageService, times(1)).uploadFile(
                anyString(),
                any(InputStream.class),
                eq("jpg")
        );
    }

    /**
     * Tests that the file extension is normalised to lower case before being
     * persisted, regardless of the case provided in the request.
     */
    @Test
    void testUpdateFileExtensionStoredAsLowerCase() throws AuthenticatedAccountNotFoundException {
        FileUploadRequest fileWithUpperExt = buildFile(1);
        fileWithUpperExt.setExtension("JPG"); // should be normalised to "jpg"
        byte[] decoded = Base64.getDecoder().decode(fileWithUpperExt.getContent());

        body.setFiles(List.of(fileWithUpperExt));

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64(fileWithUpperExt.getContent())).thenReturn(decoded);
        when(storageService.getMaxFileSize()).thenReturn(2);
        when(hazardRepository.save(any())).thenReturn(existingHazard);

        // Assign a UUID onto the instance being saved so getFileId() is non-null
        // when the service calls it immediately after save() returns.
        when(filesRepository.save(any(FilesTable.class))).thenAnswer(invocation -> {
            FilesTable fileArg = invocation.getArgument(0);
            fileArg.setFileId(UUID.randomUUID());
            return fileArg;
        });

        hazardService.update(1L, body);

        ArgumentCaptor<FilesTable> captor = ArgumentCaptor.forClass(FilesTable.class);
        verify(filesRepository).save(captor.capture());

        assertEquals("jpg", captor.getValue().getExtension());
    }

    /**
     * Tests that each file in a multi-file request is independently saved and
     * uploaded — i.e. the correct number of repository and storage calls are made.
     */
    @Test
    void testUpdateMultipleFilesEachSavedAndUploaded() throws AuthenticatedAccountNotFoundException {
        FileUploadRequest file1 = buildFile(1);
        FileUploadRequest file2 = buildFile(1);
        file2.setExtension("png");

        body.setFiles(List.of(file1, file2));

        when(hazardRepository.findById(1L)).thenReturn(Optional.of(existingHazard));
        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64(file1.getContent()))
                .thenReturn(Base64.getDecoder().decode(file1.getContent()));
        when(storageService.decodeBase64(file2.getContent()))
                .thenReturn(Base64.getDecoder().decode(file2.getContent()));
        when(storageService.getMaxFileSize()).thenReturn(2);
        when(hazardRepository.save(any())).thenReturn(existingHazard);
        when(filesRepository.save(any(FilesTable.class))).thenAnswer(invocation -> {
            FilesTable fileArg = invocation.getArgument(0);
            fileArg.setFileId(UUID.randomUUID());
            return fileArg;
        });

        hazardService.update(1L, body);

        verify(filesRepository, times(2)).save(any(FilesTable.class));
        verify(hazardFilesRepository, times(2)).save(any(HazardFilesTable.class));
        verify(storageService, times(2)).uploadFile(anyString(), any(InputStream.class), anyString());
    }

    /**
     * Tests that the controller completes without throwing when the service
     * update call succeeds.
     */
    @Test
    void testUpdateHazardSuccess() throws AuthenticatedAccountNotFoundException {
        doNothing().when(mockHazardService).update(eq(1L), any(HazardReportRequest.class));

        assertDoesNotThrow(() -> hazardController.updateHazard(1L, body));

        verify(mockHazardService).update(1L, body);
    }

    /**
     * Tests that the controller maps {@link AuthenticatedAccountNotFoundException}
     * to a 401 Unauthorized response.
     */
    @Test
    void testUpdateHazardAuthenticatedAccountNotFound() throws AuthenticatedAccountNotFoundException {
        doThrow(new AuthenticatedAccountNotFoundException())
                .when(mockHazardService).update(eq(1L), any(HazardReportRequest.class));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> hazardController.updateHazard(1L, body)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    /**
     * Tests that the controller maps {@link NoSuchElementException}
     * to a 404 Not Found response, forwarding the original message as the reason.
     */
    @Test
    void testUpdateHazardHazardNotFound() throws AuthenticatedAccountNotFoundException {
        doThrow(new NoSuchElementException("Hazard not found"))
                .when(mockHazardService).update(eq(1L), any(HazardReportRequest.class));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> hazardController.updateHazard(1L, body)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Hazard not found", exception.getReason());
    }

    /**
     * Tests that the controller maps {@link SecurityException}
     * to a 403 Forbidden response, forwarding the original message as the reason.
     */
    @Test
    void testUpdateHazardForbidden() throws AuthenticatedAccountNotFoundException {
        doThrow(new SecurityException("Access denied"))
                .when(mockHazardService).update(eq(1L), any(HazardReportRequest.class));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> hazardController.updateHazard(1L, body)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Access denied", exception.getReason());
    }

    /**
     * Tests that the controller maps {@link IllegalArgumentException}
     * to a 400 Bad Request response, forwarding the original message as the reason.
     */
    @Test
    void testUpdateHazardFileTooLarge() throws AuthenticatedAccountNotFoundException {
        doThrow(new IllegalArgumentException("File size exceeds the maximum limit."))
                .when(mockHazardService).update(eq(1L), any(HazardReportRequest.class));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> hazardController.updateHazard(1L, body)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("File size exceeds the maximum limit.", exception.getReason());
    }

    /**
     * Tests that the controller maps any unexpected {@link Exception}
     * to a 500 Internal Server Error response.
     */
    @Test
    void testUpdateHazardInternalServerError() throws AuthenticatedAccountNotFoundException {
        doThrow(new RuntimeException("Something went wrong"))
                .when(mockHazardService).update(eq(1L), any(HazardReportRequest.class));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> hazardController.updateHazard(1L, body)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }
}