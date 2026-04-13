package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.QualificationService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.QualificationResponse;

import java.util.List;

/**
 * REST controller exposing qualification endpoints.
 */
@RestController
@RequestMapping("/api/qualifications")
@RequiredArgsConstructor
public class QualificationController {
    /** Logger for logging qualification-related events and errors. */
    private static final Logger LOG = LoggerFactory.getLogger(QualificationController.class);

    /** Qualification service. */
    private final QualificationService qualificationService;

    /**
     * Retrieves qualifications for the logged-in user.
     *
     * @return list of qualifications
     */
    @GetMapping
    public List<QualificationResponse> getQualifications() {
        try {
            return qualificationService.getQualificationsForCurrentUser();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            LOG.error("Error retrieving qualifications", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }
}
