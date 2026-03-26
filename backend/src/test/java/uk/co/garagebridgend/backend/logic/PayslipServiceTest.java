package uk.co.garagebridgend.backend.logic;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.entity.PayslipsTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.PayslipResponse;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.PayslipRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PayslipServiceTest {

    private PayslipRepository payslipRepository;
    private AccountRepository accountRepository;
    private StorageService storageService;

    private PayslipService payslipService;

    @BeforeEach
    void setup() {
        payslipRepository = mock(PayslipRepository.class);
        accountRepository = mock(AccountRepository.class);
        storageService = mock(StorageService.class);

        payslipService = new PayslipService(
                payslipRepository,
                accountRepository,
                storageService
        );
    }

    /**
     * Tests successful payslip retrieval and mapping.
     */
    @Test
    void testGetPayslipsForCurrentUserSuccess() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        FilesTable file = new FilesTable();
        file.setName("January Payslip");
        file.setFileId(UUID.randomUUID());
        file.setAccount(account);

        PayslipsTable payslip = new PayslipsTable();
        payslip.setFile(file);
        payslip.setYear(2026);
        payslip.setMonth(1);
        payslip.setPSixty(false);

        when(accountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        when(payslipRepository.findByFileAccountOrderByYearDescMonthDesc(account))
                .thenReturn(List.of(payslip));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            List<PayslipResponse> result =
                    payslipService.getPayslipsForCurrentUser();

            assertEquals(1, result.size());

            PayslipResponse response = result.get(0);

            assertEquals("January Payslip", response.getName());
            assertEquals(2026, response.getYear());
            assertEquals(1, response.getMonth());
            assertFalse(response.isPSixty());
            assertEquals("test-url", response.getUrl());
        }
    }

    /**
     * Tests when AuthenticationService returns null user.
     */
    @Test
    void testUserNotAuthenticated() {

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(null);

            assertThrows(
                    AuthenticatedAccountNotFoundException.class,
                    () -> payslipService.getPayslipsForCurrentUser()
            );
        }
    }

    /**
     * Tests when authenticated user exists but account is missing in DB.
     */
    @Test
    void testAccountNotFound() {

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            when(accountRepository.findById(1L))
                    .thenReturn(Optional.empty());

            assertThrows(
                    AuthenticatedAccountNotFoundException.class,
                    () -> payslipService.getPayslipsForCurrentUser()
            );
        }
    }

    /**
     * Tests when user has no payslips.
     */
    @Test
    void testNoPayslipsReturned() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        when(accountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        when(payslipRepository.findByFileAccountOrderByYearDescMonthDesc(account))
                .thenReturn(List.of());

        try (MockedStatic<AuthenticationService> authMock =
                     mockStatic(AuthenticationService.class)) {

            UserDetails user = new User("1", "", List.of());

            authMock.when(AuthenticationService::getCurrentUser)
                    .thenReturn(user);

            List<PayslipResponse> result =
                    payslipService.getPayslipsForCurrentUser();

            assertTrue(result.isEmpty());
        }
    }
}