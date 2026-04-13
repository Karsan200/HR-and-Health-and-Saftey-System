package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.PayslipService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.PayslipResponse;

import java.util.List;

/**
 * REST controller exposing payslip-related endpoints.
 */
@RestController
@RequestMapping("/api/payslips")
@RequiredArgsConstructor
public class PayslipController {
    /** Logger for logging payslip-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(PayslipController.class);

    /** Service for handling payslip operations. */
    private final PayslipService payslipService;

    /**
     * Retrieves all payslips for the currently authenticated user.
     *
     * @return list of payslip responses including pre-signed URLs
     */
    @GetMapping
    public List<PayslipResponse> getPayslips() {
        try {
            return payslipService.getPayslipsForCurrentUser();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            LOG.error("Error retrieving payslips", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }
}
