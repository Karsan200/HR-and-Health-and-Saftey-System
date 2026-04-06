package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.AdminDashboardService;
import uk.co.garagebridgend.backend.models.exception.AuthenticatedAccountNotFoundException;
import uk.co.garagebridgend.backend.models.response.*;

import java.util.List;


/** Controller for admin dashboard related endpoints. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    /** Service layer for handling admin dashboard logic. */
    private final AdminDashboardService adminDashboardService;

    /** Endpoint to retrieve a summary of key stats for the admin dashboard.
     * @return AdminDashboardSummaryResponse containing the number of open hazards
     */
    @GetMapping("/summary")
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
                    "Internal sever error " + e.getMessage()
            );
        }
    }

    /**
     * Endpoint to retrieve late arrivals chart data for the admin dashboard.
     *
     * @param range the selected range, e.g. this-week, last-week, this-month
     * @return AdminLateArrivalsChartResponse containing chart data
     */
    @GetMapping("/late-arrivals")
    public AdminLateArrivalsChartResponse getLateArrivalsChart(
            @RequestParam(defaultValue = "this-week") final String range
    ) {
        try {
            return adminDashboardService.getLateArrivalsChart(range);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Endpoint to retrieve document signature totals for the admin dashboard.
     *
     * @param range the selected range
     * @return AdminDocumentSignaturesChartResponse containing signed and pending totals
     */
    @GetMapping("/document-signatures")
    public AdminDocumentSignaturesChartResponse getDocumentSignaturesChart(
            @RequestParam(defaultValue = "this-week") final String range
    ) {
        try {
            return adminDashboardService.getDocumentSignaturesChart(range);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Endpoint to retrieve hazards reported chart data for the admin dashboard.
     *
     * @param range the selected range, e.g. this-week, last-week, this-month
     * @return AdminHazardsReportedChartResponse containing chart data
     */
    @GetMapping("/hazards-reported")
    public AdminHazardsReportedChartResponse getHazardsReportedChart(
            @RequestParam(defaultValue = "this-week") final String range
    ) {
        try {
            return adminDashboardService.getHazardsReportedChart(range);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error " + e.getMessage()
            );
        }
    }

    /**
     * Endpoint to retrieve the most recent dashboard activity items.
     *
     * @return a list of recent activity items ordered by newest first
     */
    @GetMapping("/recent-activity")
    public List<AdminRecentActivityItemResponse> getRecentActivity() {
        try {
            return adminDashboardService.getRecentActivity();
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error " + e.getMessage()
            );
        }
    }
}
