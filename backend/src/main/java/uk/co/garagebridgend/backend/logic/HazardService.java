package uk.co.garagebridgend.backend.logic;

import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.HazardReportRequest;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.HazardFilesRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;

/**
 * Service class for handling hazard-related operations, including reporting hazards and managing associated files.
 */
@Service
public class HazardService {
    private static final int BYTES_TO_KB = 1024;

    /** Service for handling object storage interactions. */
    private final StorageService storageService;

    /** Repository for managing account data. */
    private final AccountRepository accountRepository;

    /** Repository for managing hazard data. */
    private final HazardRepository hazardRepository;

    /** Repository for managing hazard file data. */
    private final HazardFilesRepository hazardFilesRepository;

    /**
     * Constructs the HazardService with the required dependencies.
     *
     * @param storageServiceImpl       service for handling object storage interactions
     * @param accountRepositoryImpl    repository for managing account data
     * @param hazardRepositoryImpl     repository for managing hazard data
     * @param hazardFilesRepositoryImpl repository for managing hazard file data
     */
    public HazardService(
            StorageService storageServiceImpl,
            AccountRepository accountRepositoryImpl,
            HazardRepository hazardRepositoryImpl,
            HazardFilesRepository hazardFilesRepositoryImpl
    ) {
        this.storageService = storageServiceImpl;
        this.accountRepository = accountRepositoryImpl;
        this.hazardRepository = hazardRepositoryImpl;
        this.hazardFilesRepository = hazardFilesRepositoryImpl;
    }

    /**
     * Handles the reporting of a hazard based on the provided request data.
     *
     * @param body the request containing hazard report details
     */
    public void report(HazardReportRequest body) {
        // Get the current authenticated user
        var user = AuthenticationService.getCurrentUser();

        AccountTable account;
        if (user != null) {
            account = accountRepository.findById(Long.valueOf(user.getUsername()))
                    .orElseThrow(AuthenticatedAccountNotFoundException::new);
        } else {
            throw new AuthenticatedAccountNotFoundException();
        }

        // Check the size of the uploaded files
        if (!body.getFiles().isEmpty()) {
            for (var file : body.getFiles()) {
                // Check if the file size exceeds the limit
                var decodedFile = storageService.decodeBase64(file.getContent());
                if ((decodedFile.length / BYTES_TO_KB) > storageService.getMaxFileSize()) {
                    throw new IllegalArgumentException("File size exceeds the maximum limit.");
                }
            }
        }
    }
}
