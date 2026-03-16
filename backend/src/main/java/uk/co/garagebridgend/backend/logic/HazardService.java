package uk.co.garagebridgend.backend.logic;

import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.entity.HazardFilesTable;
import uk.co.garagebridgend.backend.models.entity.HazardTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.HazardReportRequest;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.FilesRepository;
import uk.co.garagebridgend.backend.repository.HazardFilesRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;

import java.io.ByteArrayInputStream;
import java.time.Clock;
import java.time.LocalDateTime;

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
    private final FilesRepository filesRepository;

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
            HazardFilesRepository hazardFilesRepositoryImpl,
            FilesRepository filesRepository) {
        this.storageService = storageServiceImpl;
        this.accountRepository = accountRepositoryImpl;
        this.hazardRepository = hazardRepositoryImpl;
        this.hazardFilesRepository = hazardFilesRepositoryImpl;
        this.filesRepository = filesRepository;
    }

    /**
     * Handles the reporting of a hazard based on the provided request data.
     *
     * @param body the request containing hazard report details
     * @throws AuthenticatedAccountNotFoundException if the authenticated account cannot be found
     * @throws IllegalArgumentException if any of the uploaded files exceed the maximum allowed size
     */
    public void report(HazardReportRequest body)
            throws AuthenticatedAccountNotFoundException, IllegalArgumentException {
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

        // Create a new hazard entry in the database
        var hazard = new HazardTable();
        hazard.setAccount(account);
        hazard.setTitle(body.getTitle());
        hazard.setQuestionOne(body.getQuestionOne());
        hazard.setQuestionTwo(body.getQuestionTwo());
        hazard.setQuestionThree(body.getQuestionThree());
        hazard.setQuestionFour(body.getQuestionFour());
        hazard.setQuestionFive(body.getQuestionFive());
        hazard.setQuestionSix(body.getQuestionSix());
        hazard.setDraft(body.isDraft());
        if (body.isCompleted()) {
            // Set UTC time for when the hazard is marked as completed
            hazard.setActionComplete(LocalDateTime.now(Clock.systemUTC()));
        }
        hazardRepository.save(hazard);

        // Handle file uploads and associate them with the hazard
        if (!body.getFiles().isEmpty()) {
            for (var file : body.getFiles()) {
                var decodedFile = storageService.decodeBase64(file.getContent());

                // Add the file to the database
                var fileObj = new FilesTable();
                fileObj.setCreatedBy(account);
                fileObj.setName(file.getName());
                fileObj.setExtension(file.getExtension().toLowerCase());
                filesRepository.save(fileObj);

                // Associate the file with the hazard
                var hazardFile = new HazardFilesTable();
                hazardFile.setHazard(hazard);
                hazardFile.setFile(fileObj);
                hazardFilesRepository.save(hazardFile);

                // Upload the file to object storage and get the URL
                storageService.uploadFile(
                        fileObj.getFileId().toString(),
                        new ByteArrayInputStream(decodedFile),
                        file.getExtension()
                );
            }
        }
    }
}
