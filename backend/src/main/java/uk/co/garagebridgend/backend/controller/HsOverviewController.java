package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

import java.util.HashMap;
import java.util.Map;

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
@RequiredArgsConstructor
public class HsOverviewController {
    /** Repository to access account data. */
    private final AccountRepository accountRepository;

    /** Repository to access document data. */
    private final DocumentRepository documentRepository;

    /** Repository to access signature data. */
    private final SignatureRepository signatureRepository;

    /** Repository to access hazard data. */
    private final HazardRepository hazardRepository;

    /**
     * GET /hs-overview.
     *
     * <p>Returns a map with integer counts for the authenticated user's H&S overview:
     * - "pendingDocs": number of pending documents for the account's files
     * - "signed": number of signatures associated with the account
     * - "hazards": number of hazards associated with the account
     *
     * Responses:
     * - 200 OK with the map on success
     * - 401 UNAUTHORIZED when no authenticated user is present
     * - 404 NOT FOUND when the authenticated user's account cannot be located
     *
     * @return ResponseEntity containing the overview map or an error status
     */
    @GetMapping("/hs-overview")
    public ResponseEntity<?> getHsOverview() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401
        }

        String username = auth.getName();

        AccountTable user = accountRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        Map<String, Integer> result = new HashMap<>();
        result.put("pendingDocs", documentRepository.countByFileAccount(user));
        result.put("signed", signatureRepository.countByAccount(user));
        result.put("hazards", hazardRepository.countByAccount(user));

        return ResponseEntity.ok(result);
    }
}
