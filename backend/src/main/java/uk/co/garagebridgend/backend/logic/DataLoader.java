//package uk.co.garagebridgend.backend.logic;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import uk.co.garagebridgend.backend.models.entity.AccountTable;
//import uk.co.garagebridgend.backend.models.entity.DocumentTable;
//import uk.co.garagebridgend.backend.models.entity.FilesTable;
//import uk.co.garagebridgend.backend.models.entity.HazardTable;
//import uk.co.garagebridgend.backend.models.entity.SignatureTable;
//import uk.co.garagebridgend.backend.repository.AccountRepository;
//import uk.co.garagebridgend.backend.repository.DocumentRepository;
//import uk.co.garagebridgend.backend.repository.FilesRepository;
//import uk.co.garagebridgend.backend.repository.HazardRepository;
//import uk.co.garagebridgend.backend.repository.SignatureRepository;
//
//@Configuration
//@RequiredArgsConstructor
//@org.springframework.context.annotation.Profile("!test")
//public class DataLoader {
//
//    /**
//     * Loads dummy data into the database on application startup if no accounts exist.
//     *
//     * @param accountRepository   repository for AccountTable
//     * @param hazardRepository    repository for HazardTable
//     * @param documentRepository  repository for DocumentTable
//     * @param signatureRepository repository for SignatureTable
//     * @param filesRepository     repository for FilesTable
//     * @return a CommandLineRunner to populate data
//     */
//    @Bean
//    public CommandLineRunner loadData(
//            final AccountRepository accountRepository,
//            final HazardRepository hazardRepository,
//            final DocumentRepository documentRepository,
//            final SignatureRepository signatureRepository,
//            final FilesRepository filesRepository) {
//
//        return args -> {
//
//            // Stop duplicates if server restarts
//            if (accountRepository.count() > 0) {
//                return;
//            }
//
//            // Maggie May Dummy Data
//            AccountTable maggie = new AccountTable();
//            maggie.setFirstName("Maggie");
//            maggie.setLastName("May");
//            maggie.setUsername("MMay");
//            maggie.setEmail("MMay@test.com");
//            maggie.setPassword("password");
//            maggie.setSalt("salt");
//            maggie.setAddressOne("Test Street");
//            maggie.setPostalCode("CF31");
//            accountRepository.save(maggie);
//
//            // Maggie's file
//            FilesTable maggieFile = new FilesTable();
//            maggieFile.setAccount(maggie);
//            maggieFile.setCreatedBy(maggie);
//            maggieFile.setName("safety_policy");
//            maggieFile.setExtension("pdf");
//            filesRepository.save(maggieFile);
//
//            // Maggie's documents
//            DocumentTable maggieDoc1 = new DocumentTable();
//            maggieDoc1.setTitle("Safety Policy");
//            maggieDoc1.setFile(maggieFile);
//            documentRepository.save(maggieDoc1);
//
//            DocumentTable maggieDoc2 = new DocumentTable();
//            maggieDoc2.setTitle("Fire Safety Instructions");
//            maggieDoc2.setFile(maggieFile);
//            documentRepository.save(maggieDoc2);
//
//            // Maggie's hazards
//            HazardTable hazard1 = new HazardTable();
//            hazard1.setAccount(maggie);
//            hazard1.setTitle("Loose cable");
//            hazard1.setQuestionOne("Cable across the floor");
//            hazard1.setQuestionTwo("Office");
//            hazard1.setQuestionThree("Trip risk");
//            hazard1.setQuestionFour("Low");
//            hazard1.setQuestionFive("Fix soon");
//            hazard1.setQuestionSix("None");
//            hazardRepository.save(hazard1);
//
//            HazardTable hazard2 = new HazardTable();
//            hazard2.setAccount(maggie);
//            hazard2.setTitle("Wet floor");
//            hazard2.setQuestionOne("Water spill");
//            hazard2.setQuestionTwo("Kitchen");
//            hazard2.setQuestionThree("Slip risk");
//            hazard2.setQuestionFour("Medium");
//            hazard2.setQuestionFive("Clean immediately");
//            hazard2.setQuestionSix("None");
//            hazardRepository.save(hazard2);
//
//            HazardTable hazard3 = new HazardTable();
//            hazard3.setAccount(maggie);
//            hazard3.setTitle("Blocked fire exit");
//            hazard3.setQuestionOne("Boxes blocking door");
//            hazard3.setQuestionTwo("Warehouse");
//            hazard3.setQuestionThree("Fire hazard");
//            hazard3.setQuestionFour("High");
//            hazard3.setQuestionFive("Remove boxes");
//            hazard3.setQuestionSix("Urgent");
//            hazardRepository.save(hazard3);
//
//            // Maggie signs one document
//            SignatureTable maggieSignature = new SignatureTable();
//            maggieSignature.setAccount(maggie);
//            maggieSignature.setDocument(maggieDoc1);
//            signatureRepository.save(maggieSignature);
//
//            // John Doe Dummy Data
//            AccountTable john = new AccountTable();
//            john.setFirstName("John");
//            john.setLastName("Doe");
//            john.setUsername("JDoe");
//            john.setEmail("JDoe@test.com");
//            john.setPassword("password");
//            john.setSalt("salt");
//            john.setAddressOne("Example Street");
//            john.setPostalCode("CF32");
//            accountRepository.save(john);
//
//            // John's file
//            FilesTable johnFile = new FilesTable();
//            johnFile.setAccount(john);
//            johnFile.setCreatedBy(john);
//            johnFile.setName("training_manual");
//            johnFile.setExtension("pdf");
//            filesRepository.save(johnFile);
//
//            // John's document
//            DocumentTable johnDoc = new DocumentTable();
//            johnDoc.setTitle("Training Manual");
//            johnDoc.setFile(johnFile);
//            documentRepository.save(johnDoc);
//
//            // John's signature
//            SignatureTable johnSignature = new SignatureTable();
//            johnSignature.setAccount(john);
//            johnSignature.setDocument(johnDoc);
//            signatureRepository.save(johnSignature);
//        };
//    }
//}
