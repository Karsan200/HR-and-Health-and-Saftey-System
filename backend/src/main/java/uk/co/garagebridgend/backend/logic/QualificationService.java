package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.QualificationResponse;
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

    /** Storage service for generating file URLs. */
    private final StorageService storageService;

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /**
     * Retrieves qualifications for the current user.
     *
     * @return list of qualification responses
     * @throws AuthenticatedAccountNotFoundException if the account cannot be found
     */
    public List<QualificationResponse> getQualificationsForCurrentUser()
            throws AuthenticatedAccountNotFoundException {

        var account = authenticationService.getCurrentUser();

        return qualificationRepository
                .findByAccountOrderByCreatedDesc(account)
                .stream()
                .map(qualification -> new QualificationResponse(
                        qualification.getTitle(),
                        qualification.getDetails(),
                        storageService.getObject(
                                qualification.getFile().getFileId().toString()
                        )
                ))
                .toList();
    }
}
