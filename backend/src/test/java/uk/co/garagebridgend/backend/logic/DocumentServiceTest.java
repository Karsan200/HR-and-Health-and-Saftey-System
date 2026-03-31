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
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.repository.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private SignatureRepository signatureRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private DocumentService documentService;

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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(documentRepository.findAllByOrderByCreatedDesc())
                .thenReturn(List.of(document));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

        when(signatureRepository.existsByAccountAndDocument(account, document))
                .thenReturn(false);

        List<DocumentResponse> result = documentService.getAllDocuments();

        assertEquals(1, result.size());
        assertEquals("Employee Contract", result.get(0).getTitle());
        assertEquals("test-url", result.get(0).getUrl());
        assertFalse(result.get(0).isSigned());
    }

    @Test
    void testUserNotAuthenticated() {

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> documentService.getAllDocuments()
        );
    }

    @Test
    void testSignDocumentSuccess() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(documentRepository.findById(1L))
                .thenReturn(Optional.of(document));

        when(signatureRepository.existsByAccountAndDocument(account, document))
                .thenReturn(false);

        documentService.signDocument(1L);

        verify(signatureRepository).save(any(SignatureTable.class));
    }

    @Test
    void testSignDocumentAlreadySigned() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(documentRepository.findById(1L))
                .thenReturn(Optional.of(document));

        when(signatureRepository.existsByAccountAndDocument(account, document))
                .thenReturn(true);

        documentService.signDocument(1L);

        verify(signatureRepository, never()).save(any());
    }
}