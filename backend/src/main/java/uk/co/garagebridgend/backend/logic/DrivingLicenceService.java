package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.QualificationsTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UploadDrivingLicenceRequest;
import uk.co.garagebridgend.backend.models.response.DrivingLicenceResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.QualificationRepository;
import uk.co.garagebridgend.backend.repository.FilesRepository;

import java.io.ByteArrayInputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DrivingLicenceService {

    /** Repository for accessing driving licence data. */
    private final QualificationRepository qualificationRepository;

    /** Repository for accessing file data. */
    private final FilesRepository filesRepository;

    /** Repository for accessing account data. */
    private final AccountRepository accountRepository;

    /** Service for generating pre-signed URLs and handling file storage. */
    private final StorageService storageService;

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /**
     * Uploads a driving licence image for a specific employee.
     * The image is stored via StorageService and linked to the employee's account.
     *
     * @param request the request containing the title, employeeId, extension, and base64 content
     * @throws AuthenticatedAccountNotFoundException if the uploading admin cannot be found
     * @throws IllegalArgumentException if the target employee account does not exist
     */
    public void uploadLicenceForEmployee(UploadDrivingLicenceRequest request)
            throws AuthenticatedAccountNotFoundException {

        // The manager performing the upload — used as createdBy on the file
        AccountTable uploadedBy = authenticationService.getCurrentUser();

        // The employee whose licence this is
        AccountTable employee = accountRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Employee not found: " + request.getEmployeeId()
                ));

        byte[] imageBytes = storageService.decodeBase64(request.getContent());

        // Persist file metadata — mirrors how DocumentService saves FilesTable
        FilesTable file = new FilesTable();
        file.setAccount(employee);          // belongs to the employee
        file.setCreatedBy(uploadedBy);      // uploaded by the manager
        file.setName(request.getTitle().trim());
        file.setExtension(request.getExtension());
        filesRepository.save(file);

        UUID fileId = file.getFileId();

        // Upload the image bytes to storage using the generated file ID
        storageService.uploadFile(
                fileId.toString(),
                new ByteArrayInputStream(imageBytes),
                request.getExtension()
        );

        // If the employee already has a licence on record, replace it
        qualificationRepository.findByAccount(employee)
                .ifPresent(qualificationRepository::delete);

        DrivingLicenceTable licence = new DrivingLicenceTable();
        licence.setAccount(employee);
        licence.setTitle(request.getTitle().trim());
        licence.setFile(file);
        qualificationRepository.save(licence);
    }

    /**
     * Retrieves the driving licence for the currently authenticated user.
     *
     * @return DrivingLicenceResponse with title and pre-signed image URL
     * @throws AuthenticatedAccountNotFoundException if the account cannot be found
     */
    public DrivingLicenceResponse getLicenceForCurrentUser()
            throws AuthenticatedAccountNotFoundException {

        AccountTable account = authenticationService.getCurrentUser();

        QualificationTable licence = qualificationRepository.findByAccount(account)
                .orElseThrow();

        return new DrivingLicenceResponse(
                licence.getTitle(),
                storageService.getPresignedUrl(licence.getFile().getFileId().toString()),
                licence.getFile().getExtension()
        );
    }
}