package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.HsOverviewService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.HsOverviewResponseModel;

/**
 * REST controller providing a Health & Safety overview for the authenticated user.
 *
 * <p>Exposes an endpoint to retrieve counts of:
 * - pending documents
 * - signed documents (signatures)
 * - hazards
 *
 * The controller relies on Spring Security to obtain the current authentication
 * from the SecurityContextHolder and uses repository beans to compute counts.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HsOverviewController {
    /** Service for handling the overview command. */
    private final HsOverviewService hsOverviewService;

    /**
     * Endpoint to retrieve the Health & Safety overview for the authenticated user.
     * @return HsOverviewResponseModel containing counts of pending documents, signed documents, and hazards
     */
    @GetMapping("/hs-overview")
    public HsOverviewResponseModel getHsOverview() {
        try {
            return hsOverviewService.getOverview();
        } catch (AuthenticatedAccountNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated account not found."
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal sever error"
            );
        }
    }
}
