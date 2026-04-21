package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.entity.PayslipsTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UploadPayslipRequest;
import uk.co.garagebridgend.backend.models.response.PayslipResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.FilesRepository;
import uk.co.garagebridgend.backend.repository.PayslipRepository;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.UUID;

/**
 * Service class for handling payslip-related operations.
 */
@Service
@RequiredArgsConstructor
public class PayslipService {

    /** Repository for accessing payslip data. */
    private final PayslipRepository payslipRepository;

    /** Service for generating pre-signed URLs for files in storage. */
    private final StorageService storageService;

    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /** Repository for accessing file data. */
    private final FilesRepository filesRepository;

    /** Repository for accessing account data. */
    private final AccountRepository accountRepository;

    /**
     * Retrieves all payslips for the currently authenticated user,
     * each including a pre-signed URL to access the PDF.
     *
     * @return list of payslip responses for the authenticated user
     * @throws AuthenticatedAccountNotFoundException if the authenticated user cannot be found
     */
    public List<PayslipResponse> getPayslipsForCurrentUser()
            throws AuthenticatedAccountNotFoundException {

        // Get the currently authenticated user
        var account = authenticationService.getCurrentUser();

        // Fetch all payslips for this account and map to response objects
        return payslipRepository
                .findByFileAccountOrderByYearDescMonthDesc(account)
                .stream()
                .map(payslip -> new PayslipResponse(
                        payslip.getFile().getName(),
                        payslip.getYear(),
                        payslip.getMonth(),
                        payslip.isPSixty(),
                        storageService.getObject(
                                payslip.getFile().getFileId().toString()
                        )
                ))
                .toList();
    }

    /**
     * Uploads a new payslip for the specified account. This involves:
     * @param request the request containing the account ID, file name, year,
     * month, isPSixty flag, and base64-encoded PDF content
     */
    public void uploadPayslip(final UploadPayslipRequest request) {

        var account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        byte[] fileBytes = storageService.decodeBase64(request.getContent());

        // Create file record
        FilesTable file = new FilesTable();
        file.setAccount(account);
        file.setCreatedBy(authenticationService.getCurrentUser());
        file.setName(request.getFileName());
        file.setExtension("pdf");

        filesRepository.save(file);

        UUID fileId = file.getFileId();

        // Upload to storage
        storageService.uploadFile(
                fileId.toString(),
                new ByteArrayInputStream(fileBytes),
                "pdf"
        );

        // Create payslip record
        PayslipsTable payslip = new PayslipsTable();
        payslip.setFile(file);
        payslip.setMonth(request.getMonth());
        payslip.setYear(request.getYear());
        payslip.setPSixty(request.isP60());

        payslipRepository.save(payslip);
    }
}
