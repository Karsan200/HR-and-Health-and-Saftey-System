package uk.co.garagebridgend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;
import uk.co.garagebridgend.backend.logic.AdminEmployeeOverviewService;
import uk.co.garagebridgend.backend.models.exception.NotFoundException;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeListItemResponse;
import uk.co.garagebridgend.backend.models.response.AdminEmployeeOverviewResponse;
import uk.co.garagebridgend.backend.models.request.AdminCreateEmployeeRequest;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing admin employee overview endpoints.
 */
@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
public class AdminEmployeeOverviewController {

    /** Service responsible for admin employee overview logic. */
    private final AdminEmployeeOverviewService adminEmployeeOverviewService;

    /**
     * Retrieves all employees for the overview list, optionally filtered by search text.
     *
     * @param search optional search text
     * @return employee list items
     */
    @GetMapping
    public List<AdminEmployeeListItemResponse> getEmployees(
            @RequestParam(required = false) final String search
    ) {
        try {
            return adminEmployeeOverviewService.getEmployees(search);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
            );
        }
    }

    /**
     * Retrieves the overview information for a specific employee.
     *
     * @param accountId the employee account id
     * @return employee overview data
     */
    @GetMapping("/{accountId}")
    public AdminEmployeeOverviewResponse getEmployeeOverview(
            @PathVariable final Long accountId
    ) {
        try {
            return adminEmployeeOverviewService.getEmployeeOverview(accountId);
        } catch (NotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
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
     * Creates a new employee account.
     *
     * @param request the employee details from the admin form
     * @return the created employee list item for immediate UI insertion
     */
    @PostMapping
    public ResponseEntity<?> createEmployee(
            @RequestBody final AdminCreateEmployeeRequest request
    ) {
        try {
            AdminEmployeeListItemResponse created =
                    adminEmployeeOverviewService.createEmployee(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (SecurityException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Internal server error."));
        }
    }
}
