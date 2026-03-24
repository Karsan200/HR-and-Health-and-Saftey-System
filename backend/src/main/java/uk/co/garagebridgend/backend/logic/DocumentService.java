package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.DocumentTable;
import uk.co.garagebridgend.backend.models.entity.SignatureTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.DocumentResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AccountRepository accountRepository;
    private final SignatureRepository signatureRepository;
    private final StorageService storageService;


    /**
     * Retrieves all documents for the currently authenticated user, including a pre-signed URL for each document's file
     * and whether the user has signed each document.
     *
     * @return list of DocumentResponse objects representing the documents for the authenticated user
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     */
    public List<DocumentResponse> getAllDocuments() throws AuthenticatedAccountNotFoundException {

        var user = AuthenticationService.getCurrentUser();
        if (user == null) throw new AuthenticatedAccountNotFoundException();

        AccountTable account = accountRepository.findById(Long.valueOf(user.getUsername()))
                .orElseThrow(AuthenticatedAccountNotFoundException::new);

        return documentRepository.findAllByOrderByCreatedDesc()
                .stream()
                .map(document -> new DocumentResponse(
                        document.getDocumentId(),
                        document.getTitle(),
                        storageService.getPresignedUrl(document.getFile().getFileId().toString()),
                        signatureRepository.existsByAccountAndDocument(account, document)
                ))
                .toList();
    }

    /**
     * Sign a document as the currently authenticated user.
     */
    public void signDocument(final Long documentId) throws AuthenticatedAccountNotFoundException {
        var user = AuthenticationService.getCurrentUser();
        if (user == null) throw new AuthenticatedAccountNotFoundException();

        AccountTable account = accountRepository.findById(Long.valueOf(user.getUsername()))
                .orElseThrow(AuthenticatedAccountNotFoundException::new);

        DocumentTable document = documentRepository.findById(documentId)
                .orElseThrow();

        // Don't create duplicate signatures
        if (signatureRepository.existsByAccountAndDocument(account, document)) return;

        SignatureTable signature = new SignatureTable();
        signature.setAccount(account);
        signature.setDocument(document);
        signatureRepository.save(signature);
    }
}