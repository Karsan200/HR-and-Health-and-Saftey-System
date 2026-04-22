package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.entity.AccountTable;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.request.ClockInCreateRequest;
import uk.co.garagebridgend.backend.models.request.ClockInOverrideRequest;
import uk.co.garagebridgend.backend.models.response.AccountSearchResponse;
import uk.co.garagebridgend.backend.models.response.ClockInAdminResponse;
import uk.co.garagebridgend.backend.repository.ClockInReportRepository;
import uk.co.garagebridgend.backend.repository.AccountRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service handling admin-only clock-in operations: retrieving all clock-ins
 * for a given date, applying manual time overrides, and searching for employees
 * by name to populate autocomplete fields.
 */
@Service
@RequiredArgsConstructor
public class ClockInAdminService {

    /** Repository for accessing clock-in records. */
    private final ClockInRepository clockInRepository;

    /** Repository for accessing clock-in issue reports. */
    private final ClockInReportRepository clockInReportRepository;

    /** Repository for looking up employee accounts when creating manual records. */
    private final AccountRepository accountRepository;

    /**
     * Returns all clock-in records for the given date across all employees,
     * with any associated employee report attached to each record.
     *
     * @param date the date to query
     * @return a list of clock-in records ordered by clock-in time ascending
     */
    public List<ClockInAdminResponse> getClockInsForDate(final LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay   = date.atTime(LocalTime.MAX);

        List<ClockInTable> records = clockInRepository.findAllForDate(startOfDay, endOfDay);

        return records.stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    /**
     * Applies an admin override to a clock-in record, replacing the existing
     * clock-in and clock-out times with the values supplied in the request.
     * Either value may be null to clear that field.
     * If the request includes removeReport=true and a report exists for this
     * record, it will also be deleted.
     * The isAdminAdjusted flag is set to true unconditionally on any override.
     *
     * @param clockId  the UUID of the clock-in record to update
     * @param override the new times to apply and whether to remove the report
     * @throws IllegalArgumentException if no record exists for the given ID
     */
    @Transactional
    public void overrideClockIn(final UUID clockId, final ClockInOverrideRequest override) {
        ClockInTable record = clockInRepository.findById(clockId)
                .orElseThrow(() -> new IllegalArgumentException("Clock-in record not found."));

        record.setClockInTime(override.clockInTime());
        record.setClockOutTime(override.clockOutTime());
        record.setAdminAdjusted(true);

        clockInRepository.save(record);

        if (override.removeReport()) {
            clockInReportRepository.findMostRecentByClockIn(record)
                    .ifPresent(clockInReportRepository::delete);
        }
    }

    /**
     * Returns all clock-in records across all employees and all dates,
     * with any associated employee report attached to each record.
     * Used when the admin selects "Show all clock-ins" on the overrides page.
     *
     * @return all clock-in records ordered by creation time ascending
     */
    public List<ClockInAdminResponse> getAllClockIns() {
        return clockInRepository.findAll()
                .stream()
                .sorted(java.util.Comparator.comparing(
                        uk.co.garagebridgend.backend.models.entity.ClockInTable::getCreated))
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new clock-in record for a specific employee on a given date.
     * The record is first inserted (allowing {@code @CreationTimestamp} to fire),
     * then immediately backdated to the start of the requested date within the
     * same transaction so that date-range queries find it correctly.
     * The isAdminAdjusted flag is set to true as this record is created manually.
     *
     * @param request the details of the clock-in record to create
     * @return the saved {@link ClockInTable} entity, including its generated ID
     * @throws IllegalArgumentException if no account exists for the given accountId,
     *                                  or if a clock-in already exists for that
     *                                  employee on the requested date
     */
    @Transactional
    public ClockInTable createClockIn(final ClockInCreateRequest request) {
        AccountTable account = accountRepository.findById(request.accountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        LocalDateTime startOfDay = request.date().atStartOfDay();
        LocalDateTime endOfDay   = request.date().atTime(LocalTime.MAX);

        boolean alreadyExists = clockInRepository.existsByAccountAndDate(
                request.accountId(), startOfDay, endOfDay
        );

        if (alreadyExists) {
            throw new IllegalArgumentException(
                    "A clock-in record already exists for this employee on " + request.date() + "."
            );
        }

        ClockInTable record = new ClockInTable();
        record.setAccount(account);
        record.setClockInTime(request.clockInTime());
        record.setClockOutTime(request.clockOutTime());
        record.setAdminAdjusted(true);
        record.setCreated(LocalDateTime.now()); // satisfy Hibernate's nullability check

        // Save first so the id is generated, then immediately backdate created
        // to the start of the requested date so date-range queries find it correctly.
        ClockInTable saved = clockInRepository.saveAndFlush(record);
        clockInRepository.backdateCreated(saved.getClockInId(), startOfDay);

        return saved;
    }

    /**
     * Permanently deletes a clock-in record and any associated report.
     * The report is deleted first to avoid a foreign key constraint violation.
     *
     * @param clockId the UUID of the clock-in record to delete
     * @throws IllegalArgumentException if no record exists for the given ID
     */
    @Transactional
    public void deleteClockIn(final UUID clockId) {
        ClockInTable record = clockInRepository.findById(clockId)
                .orElseThrow(() -> new IllegalArgumentException("Clock-in record not found."));

        clockInReportRepository.findMostRecentByClockIn(record)
                .ifPresent(clockInReportRepository::delete);

        clockInRepository.delete(record);
    }

    /**
     * Searches for employee accounts whose first or last name contains the
     * given query string (case-insensitive). Returns up to 10 results ordered
     * alphabetically. Used by the admin clock-in autocomplete dropdown.
     *
     * @param query the partial name to search for
     * @return a list of matching account summaries, or an empty list if the query is blank
     */
    public List<AccountSearchResponse> searchAccounts(final String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        return accountRepository.searchByName(query.trim())
                .stream()
                .map(account -> new AccountSearchResponse(
                        account.getAccountId(),
                        account.getFirstName() + " " + account.getLastName()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Maps a {@link ClockInTable} entity to a {@link ClockInAdminResponse},
     * attaching the most recent report for that record if one exists.
     *
     * @param record the clock-in entity to map
     * @return the mapped response object
     */
    private ClockInAdminResponse toAdminResponse(final ClockInTable record) {
        ClockInAdminResponse.ClockInReportSummary reportSummary = clockInReportRepository
                .findMostRecentByClockIn(record)
                .map(this::toReportSummary)
                .orElse(null);

        return new ClockInAdminResponse(
                record.getClockInId(),
                record.getAccount().getFirstName() + " " + record.getAccount().getLastName(),
                record.getAccount().getAccountId(),
                record.getClockInTime(),
                record.getClockOutTime(),
                record.getCreated(),
                record.isAdminAdjusted(),
                reportSummary
        );
    }

    /**
     * Maps a {@link ClockInReportTable} entity to a {@link ClockInAdminResponse.ClockInReportSummary}.
     *
     * @param report the report entity to map
     * @return the mapped summary
     */
    private ClockInAdminResponse.ClockInReportSummary toReportSummary(final ClockInReportTable report) {
        return new ClockInAdminResponse.ClockInReportSummary(
                report.getReportId(),
                report.getIssue(),
                report.getCreated()
        );
    }
}
