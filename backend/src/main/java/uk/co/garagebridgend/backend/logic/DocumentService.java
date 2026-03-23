package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    private final AccountRepository accountRepository;

    private final StorageService storageService;

    public List<DocumentResponse> getDocumentsForCurrentUser()
            throws AuthenticatedAccountNotFoundException {

        var user = AuthenticationService.getCurrentUser();

        AccountTable account;

        if (user != null) {
            account = accountRepository
                    .findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        return documentRepository
                .findByFileAccountOrderByCreatedDesc(account)
                .stream()
                .map(document -> new DocumentResponse(
                        document.getDocumentId(),
                        document.getTitle(),
                        storageService.getPresignedUrl(
                                document.getFile().getFileId().toString()
                        )
                ))
                .toList();
    }

    public DocumentResponse getDocumentForCurrentUser(Long documentId)
            throws AuthenticatedAccountNotFoundException {

        var user = AuthenticationService.getCurrentUser();

        AccountTable account;
        if (user != null) {
            account = accountRepository
                    .findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        var document = documentRepository.findById(documentId)
                .orElseThrow();

        if (!document.getFile().getAccount().equals(account)) {
            throw new RuntimeException("Unauthorized");
        }

        return new DocumentResponse(
                document.getDocumentId(),
                document.getTitle(),
                storageService.getPresignedUrl(
                        document.getFile().getFileId().toString()
                )
        );
    }
}
