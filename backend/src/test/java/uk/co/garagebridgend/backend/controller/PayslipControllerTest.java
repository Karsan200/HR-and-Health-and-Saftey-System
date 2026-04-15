package uk.co.garagebridgend.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.PayslipService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.request.UploadPayslipRequest;
import uk.co.garagebridgend.backend.models.response.PayslipResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PayslipControllerTest {

    private final PayslipService payslipService = mock(PayslipService.class);
    private final PayslipController payslipController = new PayslipController(payslipService);

    @Test
    void testGetPayslipsSuccess() throws Exception {

        List<PayslipResponse> mockResponse = List.of(
                new PayslipResponse("January Payslip", 2026, 1, false, "url1")
        );

        when(payslipService.getPayslipsForCurrentUser()).thenReturn(mockResponse);

        List<PayslipResponse> result = payslipController.getPayslips();

        assertEquals(1, result.size());
        assertEquals("January Payslip", result.get(0).getName());    }

    @Test
    void testAuthenticatedAccountNotFound() throws Exception {

        when(payslipService.getPayslipsForCurrentUser())
                .thenThrow(new AuthenticatedAccountNotFoundException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> payslipController.getPayslips()
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testInternalServerError() throws Exception {

        when(payslipService.getPayslipsForCurrentUser())
                .thenThrow(new RuntimeException());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> payslipController.getPayslips()
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Internal server error", exception.getReason());
    }

    @Test
    void testUploadPayslipSuccess() throws Exception {

        UploadPayslipRequest request = new UploadPayslipRequest(
                1L, 1, 2026, false, "base64content", "payslip.pdf"
        );

        doNothing().when(payslipService).uploadPayslip(request);

        assertDoesNotThrow(() -> payslipController.uploadPayslip(request));

        verify(payslipService).uploadPayslip(request);
    }

    @Test
    void testUploadPayslipUnauthorized() throws Exception {

        UploadPayslipRequest request = new UploadPayslipRequest(
                1L, 1, 2026, false, "base64content", "payslip.pdf"
        );

        doThrow(new AuthenticatedAccountNotFoundException())
                .when(payslipService).uploadPayslip(request);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> payslipController.uploadPayslip(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authenticated account not found.", exception.getReason());
    }

    @Test
    void testUploadPayslipInternalServerError() throws Exception {

        UploadPayslipRequest request = new UploadPayslipRequest(
                1L, 1, 2026, false, "base64content", "payslip.pdf"
        );

        doThrow(new RuntimeException())
                .when(payslipService).uploadPayslip(request);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> payslipController.uploadPayslip(request)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertEquals("Upload failed", exception.getReason());
    }
}