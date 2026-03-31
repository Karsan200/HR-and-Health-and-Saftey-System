package uk.co.garagebridgend.backend.logic;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.FilesTable;
import uk.co.garagebridgend.backend.models.entity.PayslipsTable;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.PayslipResponse;
import uk.co.garagebridgend.backend.repository.PayslipRepository;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@Transactional
class PayslipServiceTest {

    @Mock
    private PayslipRepository payslipRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AuthenticationService authenticationService;

    @InjectMocks
    private PayslipService payslipService;

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

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(payslipRepository.findByFileAccountOrderByYearDescMonthDesc(account))
                .thenReturn(List.of(payslip));

        when(storageService.getPresignedUrl(any()))
                .thenReturn("test-url");

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

    /**
     * Tests when AuthenticationService returns null user.
     */
    @Test
    void testUserNotAuthenticated() {

        when(authenticationService.getCurrentUser()).thenThrow(new AuthenticatedAccountNotFoundException());

        assertThrows(
                AuthenticatedAccountNotFoundException.class,
                () -> payslipService.getPayslipsForCurrentUser()
        );
    }

    /**
     * Tests when user has no payslips.
     */
    @Test
    void testNoPayslipsReturned() throws Exception {

        AccountTable account = new AccountTable();
        account.setAccountId(1L);

        when(authenticationService.getCurrentUser()).thenReturn(account);

        when(payslipRepository.findByFileAccountOrderByYearDescMonthDesc(account))
                .thenReturn(List.of());

        List<PayslipResponse> result =
                payslipService.getPayslipsForCurrentUser();

        assertTrue(result.isEmpty());
    }
}