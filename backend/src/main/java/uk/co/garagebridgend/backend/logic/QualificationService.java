package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.QualificationResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.QualificationRepository;

import java.util.List;

/**
 * Service class for handling qualification-related operations.
 */
@Service
@RequiredArgsConstructor
public class QualificationService {

    /** Repository for qualification entities. */
    private final QualificationRepository qualificationRepository;

    /** Repository for account entities. */
    private final AccountRepository accountRepository;

    /** Storage service for generating file URLs. */
    private final StorageService storageService;

    /**
     * Retrieves qualifications for the current user.
     *
     * @return list of qualification responses
     * @throws AuthenticatedAccountNotFoundException if the account cannot be found
     */
    public List<QualificationResponse> getQualificationsForCurrentUser()
            throws AuthenticatedAccountNotFoundException {

        var user = AuthenticationService.getCurrentUser();

        AccountTable account;
        if (user != null) {
            account = accountRepository.findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        return qualificationRepository
                .findByAccountOrderByCreatedDesc(account)
                .stream()
                .map(qualification -> new QualificationResponse(
                        qualification.getTitle(),
                        qualification.getDetails(),
                        storageService.getPresignedUrl(
                                qualification.getFile().getFileId().toString()
                        )
                ))
                .toList();
    }
}
