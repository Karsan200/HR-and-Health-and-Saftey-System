package uk.co.garagebridgend.backend.logic;

import org.springframework.stereotype.Service;
import uk.co.garagebridgend.backend.models.request.HazardReportRequest;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.HazardFilesRepository;
import uk.co.garagebridgend.backend.repository.HazardRepository;

@Service
public class HazardService {
    private final AccountRepository accountRepository;

    private final HazardRepository hazardRepository;

    private final HazardFilesRepository hazardFilesRepository;

    public HazardService(
            AccountRepository accountRepositoryImpl,
            HazardRepository hazardRepositoryImpl,
            HazardFilesRepository hazardFilesRepositoryImpl
    ) {
        this.accountRepository = accountRepositoryImpl;
        this.hazardRepository = hazardRepositoryImpl;
        this.hazardFilesRepository = hazardFilesRepositoryImpl;
    }

    public void report(HazardReportRequest body) {

    }
}
