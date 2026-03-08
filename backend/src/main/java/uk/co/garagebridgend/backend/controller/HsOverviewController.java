package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.repository.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HsOverviewController {

    private final AccountRepository accountRepository;
    private final DocumentRepository documentRepository;
    private final SignatureRepository signatureRepository;
    private final HazardRepository hazardRepository;

    @GetMapping("/hs-overview")
    public Map<String, Integer> getHsOverview() {

        // Hardcode Maggie May for now
        AccountTable maggie = accountRepository.findByUsername("MMay")
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Integer> result = new HashMap<>();
        result.put("pendingDocs", documentRepository.countByFile_Account(maggie));
        result.put("signed", signatureRepository.countByAccount(maggie));
        result.put("hazards", hazardRepository.countByAccount(maggie));

        return result;
    }
}