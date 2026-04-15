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
import uk.co.garagebridgend.backend.models.request.SendOutDocumentRequest;
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

    @Mock
    private FilesRepository filesRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private DocumentRecipientRepository documentRecipientRepository;

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

        when(documentRecipientRepository.existsByDocumentAndAccount(document, account))
                .thenReturn(true);

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
    void testGetAllDocumentsExcludesNonRecipient() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        FilesTable file = new FilesTable();
        file.setFileId(UUID.randomUUID());

        DocumentTable document = new DocumentTable();
        document.setDocumentId(1L);
        document.setTitle("Confidential Doc");
        document.setFile(file);

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(documentRepository.findAllByOrderByCreatedDesc()).thenReturn(List.of(document));
        when(documentRecipientRepository.existsByDocumentAndAccount(document, account)).thenReturn(false);

        List<DocumentResponse> result = documentService.getAllDocuments();

        assertEquals(0, result.size());
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

    @Test
    void testSendOutDocumentToEveryone() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        AccountTable recipient = new AccountTable();
        recipient.setAccountId(2L);

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "policy", true, "base64content", null
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64("base64content")).thenReturn(new byte[]{1, 2, 3});
        when(filesRepository.save(any(FilesTable.class))).thenAnswer(invocation -> {
            FilesTable f = invocation.getArgument(0);
            f.setFileId(UUID.randomUUID());
            return f;
        });
        when(documentRepository.save(any(DocumentTable.class))).thenAnswer(i -> i.getArgument(0));
        when(accountRepository.findAll()).thenReturn(List.of(account, recipient));

        documentService.sendOutDocument(request);

        verify(documentRecipientRepository, times(2)).save(any(DocumentRecipientTable.class));
    }

    @Test
    void testSendOutDocumentToSpecificRecipients() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        AccountTable recipient = new AccountTable();
        recipient.setAccountId(2L);

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "policy", true, "base64content", List.of(2L)
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64("base64content")).thenReturn(new byte[]{1, 2, 3});
        when(filesRepository.save(any(FilesTable.class))).thenAnswer(invocation -> {
            FilesTable f = invocation.getArgument(0);
            f.setFileId(UUID.randomUUID());
            return f;
        });
        when(documentRepository.save(any(DocumentTable.class))).thenAnswer(i -> i.getArgument(0));
        when(accountRepository.findAllById(List.of(2L))).thenReturn(List.of(recipient));

        documentService.sendOutDocument(request);

        verify(documentRecipientRepository, times(1)).save(any(DocumentRecipientTable.class));
    }

    @Test
    void testSendOutDocumentSopPrefixAdded() throws Exception {

        AccountTable account = new AccountTable();

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Forklift Operation", "sop", true, "base64content", List.of()
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);
        when(storageService.decodeBase64(any())).thenReturn(new byte[]{});
        when(filesRepository.save(any())).thenAnswer(invocation -> {
            FilesTable f = invocation.getArgument(0);
            f.setFileId(UUID.randomUUID());
            return f;
        });

        documentService.sendOutDocument(request);

        verify(documentRepository).save(argThat(doc ->
                doc.getTitle().startsWith("SOP: ")
        ));
    }

    @Test
    void testSendOutDocumentHandbookInvalidTitleThrows() throws Exception {

        AccountTable account = new AccountTable();

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "handbook", false, "base64content", List.of()
        );

        when(authenticationService.getCurrentUser()).thenReturn(account);

        assertThrows(
                IllegalArgumentException.class,
                () -> documentService.sendOutDocument(request)
        );

        verify(documentRepository, never()).save(any());
    }

    @Test
    void testSendOutDocumentUnauthenticated() {

        when(authenticationService.getCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        SendOutDocumentRequest request = new SendOutDocumentRequest(
                "Fire Safety Policy", "policy", true, "base64content", List.of()
        );

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> documentService.sendOutDocument(request)
        );
    }
}