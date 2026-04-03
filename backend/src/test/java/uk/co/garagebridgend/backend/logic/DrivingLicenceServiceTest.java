package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.DrivingLicenceResponse;
import uk.co.garagebridgend.backend.repository.DocumentRepository;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class DrivingLicenceServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private DrivingLicenceService drivingLicenceService;

    /**
     * Tests successful driving licence retrieval.
     */
    @Test
    void testGetDrivingLicenceSuccess() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        FilesTable file = new FilesTable();
        file.setFileId(UUID.randomUUID());
        file.setExtension("pdf");

        DocumentTable document = new DocumentTable();
        document.setTitle("Driving Licence");
        document.setFile(file);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(documentRepository
                .findByFileAccountAndTitleContainingIgnoreCaseOrderByCreatedDesc(
                        account, "driving licence"))
                .thenReturn(List.of(document));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

        DrivingLicenceResponse result =
                drivingLicenceService.getDrivingLicenceForCurrentUser();

        assertEquals("Driving Licence", result.getTitle());
        assertEquals("pdf", result.getExtension());
        assertEquals("test-url", result.getUrl());
    }

    /**
     * Tests when no driving licence exists.
     */
    @Test
    void testNoDrivingLicenceFound() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(documentRepository
                .findByFileAccountAndTitleContainingIgnoreCaseOrderByCreatedDesc(
                        account, "driving licence"))
                .thenReturn(List.of());

        assertThrows(
                NotFoundException.class,
                () -> drivingLicenceService.getDrivingLicenceForCurrentUser()
        );
    }

    /**
     * Tests when user authentication fails.
     */
    @Test
    void testUserNotAuthenticated() {

        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> drivingLicenceService.getDrivingLicenceForCurrentUser()
        );
    }
}