package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.AdminDashboardService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.AdminDashboardSummaryResponse;


/** Controller for admin dashboard related endpoints. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdminDashboardController {

    /** Service layer for handling admin dashboard logic. */
    private final AdminDashboardService adminDashboardService;

    /** Endpoint to retrieve a summary of key stats for the admin dashboard.
     * @return AdminDashboardSummaryResponse containing the number of open hazards
     */
    @GetMapping("/admin/summary")
    public AdminDashboardSummaryResponse getAdminDashboardSummary() {
        try {
            return adminDashboardService.getAdminDashboardSummary();
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
