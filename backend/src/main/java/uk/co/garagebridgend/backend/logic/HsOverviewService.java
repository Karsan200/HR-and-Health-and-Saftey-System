package uk.co.garagebridgend.backend.logic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.HsOverviewResponseModel;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.DocumentRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;
import uk.co.garagebridgend.backend.repository.SignatureRepository;

/**
 * Service class responsible for computing the Health & Safety overview data for the authenticated user.
 *
 * <p>This service interacts with the AccountRepository to identify the user's account and then
 * uses the DocumentRepository, SignatureRepository, and HazardRepository to compute counts of
 * pending documents, signed documents, and hazards associated with that account.
 */
@Service
public class HsOverviewService {
    /** Service for handling authentication and retrieving the current user. */
    private final AuthenticationService authenticationService;

    /** Repository to access account data. */
    private final AccountRepository accountRepository;

    /** Repository to access document data. */
    private final DocumentRepository documentRepository;

    /** Repository to access signature data. */
    private final SignatureRepository signatureRepository;

    /** Repository to access hazard data. */
    private final HazardRepository hazardRepository;

    /**
     * Constructs the HsOverviewService with the required repositories.
     *
     * @param authenticationServiceImpl service for handling authentication and retrieving the current user
     * @param accountRepositoryImpl   repository for AccountTable
     * @param documentRepositoryImpl  repository for DocumentTable
     * @param signatureRepositoryImpl repository for SignatureTable
     * @param hazardRepositoryImpl    repository for HazardTable
     */
    @Autowired
    public HsOverviewService(
            final AuthenticationService authenticationServiceImpl,
            final AccountRepository accountRepositoryImpl,
            final DocumentRepository documentRepositoryImpl,
            final SignatureRepository signatureRepositoryImpl,
            final HazardRepository hazardRepositoryImpl) {
        this.authenticationService = authenticationServiceImpl;
        this.accountRepository = accountRepositoryImpl;
        this.documentRepository = documentRepositoryImpl;
        this.signatureRepository = signatureRepositoryImpl;
        this.hazardRepository = hazardRepositoryImpl;
    }

    /**
     * Retrieves an overview of Health & Safety data for the currently authenticated user.
     * @return HsOverviewResponseModel containing counts of pending documents, signed documents,
     * and hazards for the user's account
     */
    public HsOverviewResponseModel getOverview() {
        // Get the current authenticated user
        var account = authenticationService.getCurrentUser();

        int pendingDocs = documentRepository.countByFileAccount(account);
        int signed = signatureRepository.countByAccount(account);
        int hazards = hazardRepository.countByAccount(account);

        return new HsOverviewResponseModel(pendingDocs, signed, hazards);
    }
}
