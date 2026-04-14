package uk.co.garagebridgend.backend.logic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.co.garagebridgend.backend.models.entity.ClockInReportTable;
import uk.co.garagebridgend.backend.models.entity.ClockInTable;
import uk.co.garagebridgend.backend.models.request.ClockInOverrideRequest;
import uk.co.garagebridgend.backend.models.response.ClockInAdminResponse;
import uk.co.garagebridgend.backend.repository.ClockInReportRepository;
import uk.co.garagebridgend.backend.repository.ClockInRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service handling admin-only clock-in operations: retrieving all clock-ins
 * for a given date and applying manual time overrides.
 */
@Service
@RequiredArgsConstructor
public class ClockInAdminService {

    /** Repository for accessing clock-in records. */
    private final ClockInRepository clockInRepository;

    /** Repository for accessing clock-in issue reports. */
    private final ClockInReportRepository clockInReportRepository;

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
     *
     * @param clockId  the UUID of the clock-in record to update
     * @param override the new times to apply
     * @throws IllegalArgumentException if no record exists for the given ID
     */
    @Transactional
    public void overrideClockIn(final UUID clockId, final ClockInOverrideRequest override) {
        ClockInTable record = clockInRepository.findById(clockId)
                .orElseThrow(() -> new IllegalArgumentException("Clock-in record not found."));

        record.setClockInTime(override.clockInTime());
        record.setClockOutTime(override.clockOutTime());

        clockInRepository.save(record);
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
