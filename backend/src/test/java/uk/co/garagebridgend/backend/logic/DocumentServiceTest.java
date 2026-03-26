package uk.co.garagebridgend.backend.logic;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import uk.co.garagebridgend.backend.models.entity.*;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.repository.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentServiceTest {

    private DocumentRepository documentRepository;
    private AccountRepository accountRepository;
    private SignatureRepository signatureRepository;
    private StorageService storageService;

    private DocumentService documentService;

    @BeforeEach
    void setup() {
        documentRepository = mock(DocumentRepository.class);
        accountRepository = mock(AccountRepository.class);
        signatureRepository = mock(SignatureRepository.class);
        storageService = mock(StorageService.class);

        documentService = new DocumentService(
                documentRepository,
                accountRepository,
                signatureRepository,
                storageService
        );
    }

    @Test
    void testGetAllDocumentsSuccess() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        FilesTable file = new FilesTable();
        file.setFileId(UUID.randomUUID());

        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);
        document.setTitle("Employee Contract");
        document.setFile(file);

        when(accountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        when(documentRepository.findAllByOrderByCreatedDesc())
                .thenReturn(List.of(document));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

        when(signatureRepository.existsByAccountAndDocument(account, document))
                .thenReturn(false);

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            List<DocumentResponse> result = documentService.getAllDocuments();

            assertEquals(1, result.size());
            assertEquals("Employee Contract", result.get(0).getTitle());
            assertEquals("test-url", result.get(0).getUrl());
            assertFalse(result.get(0).isSigned());
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
                    () -> documentService.getAllDocuments()
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
                    () -> documentService.getAllDocuments()
            );
        }
    }

    @Test
    void testSignDocumentSuccess() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(accountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        when(documentRepository.findById(1L))
                .thenReturn(Optional.of(document));

        when(signatureRepository.existsByAccountAndDocument(account, document))
                .thenReturn(false);

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            documentService.signDocument(1L);

            verify(signatureRepository).save(any(SignatureTable.class));
        }
    }

    @Test
    void testSignDocumentAlreadySigned() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(accountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        when(documentRepository.findById(1L))
                .thenReturn(Optional.of(document));

        when(signatureRepository.existsByAccountAndDocument(account, document))
                .thenReturn(true);

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            documentService.signDocument(1L);

            verify(signatureRepository, never()).save(any());
        }
    }
}