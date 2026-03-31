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
import uk.co.garagebridgend.backend.models.response.QualificationResponse;
import uk.co.garagebridgend.backend.repository.*;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class QualificationServiceTest {

    @Mock
    private QualificationRepository qualificationRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private QualificationService qualificationService;

    @Test
    void testGetQualificationsSuccess() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        FilesTable file = new FilesTable();
        file.setFileId(UUID.randomUUID());

        QualificationsTable qualification = new QualificationsTable();
        qualification.setTitle("Health and Safety");
        qualification.setDetails("Workplace safety training");
        qualification.setFile(file);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(qualificationRepository.findByAccountOrderByCreatedDesc(account))
                .thenReturn(List.of(qualification));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

        List<QualificationResponse> result =
                qualificationService.getQualificationsForCurrentUser();

        assertEquals(1, result.size());
        assertEquals("Health and Safety", result.get(0).getTitle());
        assertEquals("Workplace safety training", result.get(0).getDetails());
        assertEquals("test-url", result.get(0).getUrl());
    }

    @Test
    void testUserNotAuthenticated() {

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> qualificationService.getQualificationsForCurrentUser()
        );
    }
}