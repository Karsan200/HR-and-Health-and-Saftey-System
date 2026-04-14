import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    IconButton,
    Modal,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";

import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { useAuth } from "../AuthContext";
import {
    fetchClockInsForDate,
    fetchAllClockIns,
    submitClockOverride,
    formatTime,
    formatDateHeading,
    toBackendTime,
    type ClockInRecord,
} from "../logic/ClockOverridesService";
import { clockOverridesPageStyles as styles } from "./ClockOverridesPage.styles";
import { DefaultColours } from "../theme/colours";

function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

type SortOption = "date-asc" | "date-desc" | "reported-first" | "employee-asc";

// Edit modal

interface EditModalProps {
    record: ClockInRecord | null;
    open: boolean;
    onClose: () => void;
    onSaved: (clockId: string, newIn: string | null, newOut: string | null, removeReport: boolean) => void;
}

function EditClockInModal({ record, open, onClose, onSaved }: EditModalProps) {
    const { authenticationService } = useAuth();

    const [clockIn, setClockIn]       = useState<string>("");
    const [clockOut, setClockOut]     = useState<string>("");
    const [dismissReport, setDismissReport] = useState<boolean>(true);
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState<string | null>(null);

    useEffect(() => {
        if (!record) return;
        setClockIn(formatTime(record.clockInTime)   ?? "");
        setClockOut(formatTime(record.clockOutTime) ?? "");
        setDismissReport(true);
        setError(null);
    }, [record]);

    async function handleSave() {
        if (!record) return;
        setSaving(true);
        setError(null);
        try {
            const newIn  = toBackendTime(clockIn  || null);
            const newOut = toBackendTime(clockOut || null);

            await submitClockOverride(record.clockId, {
                clockInTime:  newIn,
                clockOutTime: newOut,
                removeReport: record.report !== null && dismissReport,
            }, authenticationService);

            onSaved(record.clockId, newIn, newOut, record.report !== null && dismissReport);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    if (!record) return null;

    return (
        <Modal open={open} onClose={onClose} sx={styles.modalBackdrop}>
            <Box sx={styles.modalPanel}>

                <Box sx={styles.modalHeader}>
                    <Box>
                        <Typography sx={styles.modalTitle}>Edit Clock-in</Typography>
                        <Typography sx={styles.modalSubtitle}>
                            {record.employeeName}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={styles.modalCloseButton} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {record.report && (
                    <Box sx={styles.reportPanel}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <WarningAmberOutlined sx={{ fontSize: "18px", color: DefaultColours.amberTextDark }} />
                            <Typography sx={styles.reportPanelTitle}>Employee Report</Typography>
                        </Box>
                        <Typography sx={styles.reportPanelText}>
                            {record.report.issue}
                        </Typography>
                    </Box>
                )}

                {record.report && (
                    <Box sx={styles.dismissReportRow}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={dismissReport}
                                    onChange={(e) => setDismissReport(e.target.checked)}
                                    disabled={saving}
                                    sx={{
                                        color: DefaultColours.amberPrimary,
                                        "&.Mui-checked": { color: DefaultColours.amberPrimary },
                                        padding: "0 8px 0 0",
                                    }}
                                />
                            }
                            label={
                                <Typography sx={styles.dismissReportLabel}>
                                    Remove the attached report after saving
                                </Typography>
                            }
                            sx={{ margin: 0 }}
                        />
                    </Box>
                )}

                <Box sx={styles.clockPickersRow}>
                    <Box sx={styles.clockPickerWrapper}>
                        <Typography sx={styles.clockPickerLabel}>Clock In</Typography>
                        <TextField
                            type="time"
                            value={clockIn}
                            onChange={(e) => setClockIn(e.target.value)}
                            disabled={saving}
                            size="small"
                            fullWidth
                            sx={styles.timeTextField}
                            inputProps={{ step: 60 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <Box sx={styles.clockPickerWrapper}>
                        <Typography sx={styles.clockPickerLabel}>Clock Out</Typography>
                        <TextField
                            type="time"
                            value={clockOut}
                            onChange={(e) => setClockOut(e.target.value)}
                            disabled={saving}
                            size="small"
                            fullWidth
                            sx={styles.timeTextField}
                            inputProps={{ step: 60 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </Box>

                {error && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                <Box sx={styles.modalActions}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={saving}
                        sx={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving
                            ? <CircularProgress size={16} sx={{ color: DefaultColours.white }} />
                            : undefined
                        }
                        sx={styles.saveButton}
                    >
                        {saving ? "Saving..." : "Save Override"}
                    </Button>
                </Box>

            </Box>
        </Modal>
    );
}

// Clock-in card

interface ClockInCardProps {
    record: ClockInRecord;
    onEdit: (record: ClockInRecord) => void;
}

function ClockInCard({ record, onEdit }: ClockInCardProps) {
    const hasReport = record.report !== null;
    const clockIn   = formatTime(record.clockInTime);
    const clockOut  = formatTime(record.clockOutTime);

    const createdDate = new Date(record.created).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <Box sx={styles.clockInCard(hasReport)}>
            <Box sx={styles.cardInner}>

                <Box sx={styles.cardTopRow}>
                    <Box sx={styles.employeeBlock}>
                        <Typography sx={styles.employeeName}>
                            {record.employeeName}
                        </Typography>
                        {hasReport && (
                            <Box sx={styles.reportBadge}>
                                <WarningAmberOutlined sx={{ fontSize: "18px", color: DefaultColours.amberTextDark }} />
                                <Typography sx={styles.reportBadgeText}>Reported</Typography>
                            </Box>
                        )}
                        <Typography sx={styles.metaText}>
                            Recorded on {createdDate}
                        </Typography>
                    </Box>
                </Box>

                {hasReport && (
                    <Box sx={styles.reportIssueBox}>
                        <Typography sx={styles.reportIssueLabel}>Employee Report</Typography>
                        <Typography sx={styles.reportIssueText}>
                            {record.report!.issue}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Box sx={styles.timesRow}>
                        <Box sx={styles.timeBlock}>
                            <Typography sx={styles.timeLabel}>Clock In</Typography>
                            <Typography sx={styles.timeValue(!clockIn)}>
                                {clockIn ?? "--:--"}
                            </Typography>
                        </Box>

                        <Box sx={styles.timeBlock}>
                            <Typography sx={styles.timeLabel}>Clock Out</Typography>
                            <Typography sx={styles.timeValue(!clockOut)}>
                                {clockOut ?? "--:--"}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<EditIcon sx={{ color: DefaultColours.white, fontSize: "20px" }} />}
                        onClick={() => onEdit(record)}
                        sx={styles.editButton}
                    >
                        <Typography sx={styles.editButtonLabel}>Edit Times</Typography>
                    </Button>
                </Box>

            </Box>
        </Box>
    );
}

// Page

export function ClockOverridesPage() {
    const { authenticationService } = useAuth();

    const [selectedDate, setSelectedDate]         = useState<string>(todayISO());
    const [employeeFilter, setEmployeeFilter]     = useState<string>("");
    const [sortBy, setSortBy]                     = useState<SortOption>("date-asc");
    const [showReportedOnly, setShowReportedOnly] = useState<boolean>(false);
    const [showAll, setShowAll]                     = useState<boolean>(false);
    const [records, setRecords]                   = useState<ClockInRecord[]>([]);
    const [loading, setLoading]                   = useState(false);
    const [error, setError]                       = useState<string | null>(null);
    const [editingRecord, setEditingRecord]       = useState<ClockInRecord | null>(null);
    const [modalOpen, setModalOpen]               = useState(false);

    const loadRecords = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = showAll
                ? await fetchAllClockIns(authenticationService)
                : await fetchClockInsForDate(selectedDate, authenticationService);
            setRecords(data);
        } catch {
            setError("Failed to load clock-in records. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [selectedDate, showAll, authenticationService]);

    useEffect(() => {
        void loadRecords();
    }, [loadRecords]);

    const filteredAndSorted = useMemo(() => {
        let result = [...records];

        if (showReportedOnly) {
            result = result.filter((r) => r.report !== null);
        }

        if (employeeFilter.trim()) {
            const q = employeeFilter.toLowerCase();
            result = result.filter((r) => r.employeeName.toLowerCase().includes(q));
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case "date-asc":
                    return a.created.localeCompare(b.created);
                case "date-desc":
                    return b.created.localeCompare(a.created);
                case "reported-first":
                    return (b.report ? 1 : 0) - (a.report ? 1 : 0);
                case "employee-asc":
                    return a.employeeName.localeCompare(b.employeeName);
                default:
                    return 0;
            }
        });

        return result;
    }, [records, showReportedOnly, employeeFilter, sortBy]);

    function handleEdit(record: ClockInRecord) {
        setEditingRecord(record);
        setModalOpen(true);
    }

    function handleSaved(clockId: string, newIn: string | null, newOut: string | null, removeReport: boolean) {
        setRecords((prev) =>
            prev.map((r) =>
                r.clockId === clockId
                    ? { ...r, clockInTime: newIn, clockOutTime: newOut, report: removeReport ? null : r.report }
                    : r
            )
        );
    }

    const reportedCount = records.filter((r) => r.report !== null).length;

    const calendarTabs: SectionNavTab[] = [
        { label: "Calendar View",    route: "/calendar" },
        { label: "Pending Requests", route: "/calendar/requests" },
        { label: "Clock Overrides",  route: "/calendar/overrides", alert: true, count: reportedCount },
    ];

    const filterSx = { ...styles.filterField, minWidth: "160px" };

    return (
        <Box sx={styles.pageContainer}>
            <SectionNavBar tabs={calendarTabs} />

            {/* Filters — always visible */}
            <Box sx={styles.filtersCard}>
                <TextField
                    type="date"
                    label="Date"
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setShowAll(false);
                    }}
                    size="small"
                    disabled={showAll}
                    sx={{ ...styles.filterField, minWidth: "180px", opacity: showAll ? 0.5 : 1 }}
                    InputLabelProps={{ shrink: true }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showAll}
                            onChange={(e) => setShowAll(e.target.checked)}
                            sx={{
                                color: DefaultColours.greyIconLight,
                                "&.Mui-checked": { color: DefaultColours.redPrimary },
                            }}
                        />
                    }
                    label={
                        <Typography sx={{ ...styles.filterField["& .MuiInputLabel-root"], fontSize: "14px", color: DefaultColours.greyPrimaryMainText }}>
                            Show all clock-ins
                        </Typography>
                    }
                    sx={{ marginLeft: 0, whiteSpace: "nowrap" }}
                />

                <Box sx={styles.filterDivider} />

                <TextField
                    label="Search employee"
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    size="small"
                    placeholder="Name..."
                    sx={{ ...styles.filterField, minWidth: "200px" }}
                    InputLabelProps={{ shrink: true }}
                />

                <Box sx={styles.filterDivider} />

                <FormControl size="small" sx={filterSx}>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort by"
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                        <MenuItem value="date-asc">Time (earliest first)</MenuItem>
                        <MenuItem value="date-desc">Time (latest first)</MenuItem>
                        <MenuItem value="reported-first">Reported first</MenuItem>
                        <MenuItem value="employee-asc">Employee (A–Z)</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={filterSx}>
                    <InputLabel>Show</InputLabel>
                    <Select
                        value={showReportedOnly ? "reported" : "all"}
                        label="Show"
                        onChange={(e) => setShowReportedOnly(e.target.value === "reported")}
                    >
                        <MenuItem value="all">All clock-ins</MenuItem>
                        <MenuItem value="reported">Reported only</MenuItem>
                    </Select>
                </FormControl>

                <Typography sx={styles.resultSummary}>
                    {filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? "s" : ""}
                    {reportedCount > 0 && ` · ${reportedCount} reported`}
                </Typography>
            </Box>

            {loading && (
                <Box sx={styles.loadingContainer}>
                    <CircularProgress size={32} sx={{ color: DefaultColours.redTextDark }} />
                </Box>
            )}

            {!loading && error && (
                <Box sx={styles.emptyState}>
                    <Typography sx={styles.errorText}>{error}</Typography>
                </Box>
            )}

            {!loading && !error && filteredAndSorted.length === 0 && (
                <Box sx={styles.emptyState}>
                    <CalendarTodayOutlined sx={{ fontSize: "40px", color: DefaultColours.greyIconLight }} />
                    <Typography sx={styles.emptyStateText}>
                        No clock-ins match your filters
                    </Typography>
                    <Typography sx={styles.emptyStateSubtext}>
                        {formatDateHeading(selectedDate)}
                    </Typography>
                </Box>
            )}

            {!loading && !error && filteredAndSorted.map((record) => (
                <ClockInCard
                    key={record.clockId}
                    record={record}
                    onEdit={handleEdit}
                />
            ))}

            <EditClockInModal
                record={editingRecord}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        </Box>
    );
}