package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.PayslipResponse;
import uk.co.garagebridgend.backend.repository.PayslipRepository;

import java.util.List;

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
                        storageService.getPresignedUrl(
                                payslip.getFile().getFileId().toString()
                        )
                ))
                .toList();
    }
}
