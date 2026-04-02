package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.DrivingLicenceResponse;
import uk.co.garagebridgend.backend.repository.DocumentRepository;

/**
 * Service class for handling driving licence retrieval.
 */
@Service
@RequiredArgsConstructor
public class DrivingLicenceService {

    /** Repository for accessing document data. */
    private final DocumentRepository documentRepository;

    /** Service for generating pre-signed URLs for files in storage. */
    private final StorageService storageService;

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /**
     * Retrieves the most recent driving licence document for the currently
     * authenticated user.
     *
     * @return a DrivingLicenceResponse containing the title and pre-signed URL
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     * @throws NotFoundException if no driving licence document is found for the user
     */
    public DrivingLicenceResponse getDrivingLicenceForCurrentUser()
            throws AuthenticatedAccountNotFoundException, NotFoundException {

        var account = authenticationService.getCurrentUser();

        var documents = documentRepository
                .findByFileAccountAndTitleContainingIgnoreCaseOrderByCreatedDesc(
                        account, "driving licence"
                );

        if (documents.isEmpty()) {
            throw new NotFoundException("No driving licence found for this account.");
        }

        // Take the most recent (first due to DESC ordering)
        var latest = documents.get(0);

        String url = storageService.getPresignedUrl(
                latest.getFile().getFileId().toString()
        );

        return new DrivingLicenceResponse(
                latest.getTitle(),
                latest.getFile().getExtension(),
                storageService.getPresignedUrl(
                        latest.getFile().getFileId().toString()
                )
        );    }
}