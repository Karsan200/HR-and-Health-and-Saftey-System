package uk.co.garagebridgend.backend.logic;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import uk.co.garagebridgend.backend.models.entity.*;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.QualificationResponse;
import uk.co.garagebridgend.backend.repository.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QualificationServiceTest {

    private QualificationRepository qualificationRepository;
    private AccountRepository accountRepository;
    private StorageService storageService;

    private QualificationService qualificationService;

    @BeforeEach
    void setup() {

        qualificationRepository = mock(QualificationRepository.class);
        accountRepository = mock(AccountRepository.class);
        storageService = mock(StorageService.class);

        qualificationService = new QualificationService(
                qualificationRepository,
                accountRepository,
                storageService
        );
    }

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

        when(accountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        when(qualificationRepository.findByAccountOrderByCreatedDesc(account))
                .thenReturn(List.of(qualification));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            List<QualificationResponse> result =
                    qualificationService.getQualificationsForCurrentUser();

            assertEquals(1, result.size());
            assertEquals("Health and Safety", result.get(0).getTitle());
            assertEquals("Workplace safety training", result.get(0).getDetails());
            assertEquals("test-url", result.get(0).getUrl());
        }
    }

    @Test
    void testUserNotAuthenticated() {

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(null);

            assertThrows(
                    AuthenticatedAccountNotFoundException.class,
                    () -> qualificationService.getQualificationsForCurrentUser()
            );
        }
    }

    @Test
    void testAccountNotFound() {

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            when(accountRepository.findById(1L))
                    .thenReturn(Optional.empty());

            assertThrows(
                    AuthenticatedAccountNotFoundException.class,
                    () -> qualificationService.getQualificationsForCurrentUser()
            );
        }
    }
}