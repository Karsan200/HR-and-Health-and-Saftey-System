import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
    Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";

import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { useAuth } from "../AuthContext";
import {
    fetchClockInsForDate,
    fetchAllClockIns,
    submitClockOverride,
    createClockIn,
    deleteClockIn,
    searchAccounts,
    formatTime,
    formatDateHeading,
    toBackendTime,
    type ClockInRecord,
    type AccountSearchResult,
} from "../logic/ClockOverridesService";
import { clockOverridesPageStyles as styles } from "./ClockOverridesPage.styles";
import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles, BorderRadius } from "../theme/theme";

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

    const [clockIn, setClockIn]               = useState<string>("");
    const [clockOut, setClockOut]             = useState<string>("");
    const [dismissReport, setDismissReport]   = useState<boolean>(true);
    const [saving, setSaving]                 = useState(false);
    const [error, setError]                   = useState<string | null>(null);

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
                        />
                    </Box>
                </Box>

                {error && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                <Box sx={styles.modalActions}>
                    <Button variant="outlined" onClick={onClose} disabled={saving} sx={styles.cancelButton}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={16} sx={{ color: DefaultColours.white }} /> : undefined}
                        sx={styles.saveButton}
                    >
                        {saving ? "Saving..." : "Save Override"}
                    </Button>
                </Box>

            </Box>
        </Modal>
    );
}

// Employee name autocomplete field

interface EmployeeAutocompleteProps {
    value: AccountSearchResult | null;
    onChange: (result: AccountSearchResult | null) => void;
    disabled: boolean;
}

function EmployeeAutocomplete({ value, onChange, disabled }: EmployeeAutocompleteProps) {
    const { authenticationService } = useAuth();

    const [inputValue, setInputValue]     = useState<string>("");
    const [suggestions, setSuggestions]   = useState<AccountSearchResult[]>([]);
    const [open, setOpen]                 = useState(false);
    const [searching, setSearching]       = useState(false);
    const debounceRef                     = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef                      = useRef<HTMLDivElement>(null);

    // When a value is selected externally (e.g. reset on modal open), sync the input
    useEffect(() => {
        if (value === null) {
            setInputValue("");
            setSuggestions([]);
            setOpen(false);
        }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        setInputValue(raw);

        // Clear the confirmed selection whenever the user edits the field
        if (value !== null) {
            onChange(null);
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!raw.trim()) {
            setSuggestions([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await searchAccounts(raw, authenticationService);
                setSuggestions(results);
                setOpen(results.length > 0);
            } catch {
                setSuggestions([]);
                setOpen(false);
            } finally {
                setSearching(false);
            }
        }, 250);
    }

    function handleSelect(result: AccountSearchResult) {
        onChange(result);
        setInputValue(result.fullName);
        setSuggestions([]);
        setOpen(false);
    }

    const isConfirmed = value !== null && inputValue === value.fullName;

    return (
        <Box ref={wrapperRef} sx={{ position: "relative", width: "100%" }}>
            <TextField
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
                disabled={disabled}
                size="small"
                fullWidth
                placeholder="Search by name..."
                autoComplete="off"
                InputProps={{
                    endAdornment: searching ? (
                        <CircularProgress size={16} sx={{ color: DefaultColours.greyIconLight, mr: "4px" }} />
                    ) : isConfirmed ? (
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            pr: "4px",
                        }}>
                            <Box sx={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: DefaultColours.greenPrimary,
                                flexShrink: 0,
                            }} />
                            <Typography sx={{
                                ...TextStyles.regular,
                                fontSize: FontSize.xs14,
                                color: DefaultColours.greyPrimaryMainText,
                                whiteSpace: "nowrap",
                            }}>
                                ID {value.accountId}
                            </Typography>
                        </Box>
                    ) : (
                        <PersonSearchOutlinedIcon sx={{ fontSize: "18px", color: DefaultColours.greyIconLight, mr: "4px" }} />
                    ),
                }}
                sx={{
                    ...styles.timeTextField,
                    "& .MuiOutlinedInput-root": {
                        ...styles.timeTextField["& .MuiOutlinedInput-root"],
                        ...(isConfirmed && {
                            "& fieldset": {
                                borderColor: DefaultColours.greenPrimary,
                                borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                                borderColor: DefaultColours.greenTextDark,
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: DefaultColours.greenPrimary,
                                borderWidth: "1px",
                            },
                        }),
                    },
                }}
            />

            {open && suggestions.length > 0 && (
                <Paper
                    elevation={4}
                    sx={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        zIndex: 1400,
                        borderRadius: `${BorderRadius.mediumNotification}px`,
                        overflow: "hidden",
                        border: `1px solid ${DefaultColours.greyIconLight}`,
                        boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.10)",
                    }}
                >
                    {suggestions.map((result, index) => (
                        <Box
                            key={result.accountId}
                            onMouseDown={(e) => {
                                // Prevent the input's onBlur from firing before onClick
                                e.preventDefault();
                                handleSelect(result);
                            }}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 16px",
                                cursor: "pointer",
                                borderBottom: index < suggestions.length - 1
                                    ? `1px solid ${DefaultColours.greyBackground}`
                                    : "none",
                                backgroundColor: DefaultColours.white,
                                "&:hover": {
                                    backgroundColor: DefaultColours.greyBackground,
                                },
                                transition: "background-color 0.12s ease",
                            }}
                        >
                            <Typography sx={{
                                ...TextStyles.medium,
                                fontSize: FontSize.s16,
                                color: DefaultColours.black,
                            }}>
                                {result.fullName}
                            </Typography>
                            <Typography sx={{
                                ...TextStyles.regular,
                                fontSize: FontSize.xs14,
                                color: DefaultColours.greyPrimaryMainText,
                            }}>
                                ID {result.accountId}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
}

// Add clock-in modal

interface AddModalProps {
    open: boolean;
    defaultDate: string;
    onClose: () => void;
    onAdded: (record: ClockInRecord) => void;
}

function AddClockInModal({ open, defaultDate, onClose, onAdded }: AddModalProps) {
    const { authenticationService } = useAuth();

    const [selectedEmployee, setSelectedEmployee] = useState<AccountSearchResult | null>(null);
    const [date, setDate]                         = useState<string>(defaultDate);
    const [clockIn, setClockIn]                   = useState<string>("");
    const [clockOut, setClockOut]                 = useState<string>("");
    const [saving, setSaving]                     = useState(false);
    const [error, setError]                       = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setSelectedEmployee(null);
        setDate(defaultDate);
        setClockIn("");
        setClockOut("");
        setError(null);
    }, [open, defaultDate]);

    async function handleAdd() {
        if (!selectedEmployee) {
            setError("Please select an employee from the suggestions.");
            return;
        }
        if (!date) {
            setError("Date is required.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await createClockIn({
                accountId:   selectedEmployee.accountId,
                date,
                clockInTime:  toBackendTime(clockIn  || null),
                clockOutTime: toBackendTime(clockOut || null),
            }, authenticationService);

            onAdded({
                clockId:      crypto.randomUUID(),
                employeeName: selectedEmployee.fullName,
                accountId:    selectedEmployee.accountId,
                clockInTime:  toBackendTime(clockIn  || null),
                clockOutTime: toBackendTime(clockOut || null),
                created:      `${date}T00:00:00`,
                report:       null,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal open={open} onClose={onClose} sx={styles.modalBackdrop}>
            <Box sx={styles.modalPanel}>

                <Box sx={styles.modalHeader}>
                    <Box>
                        <Typography sx={styles.modalTitle}>Add Clock-in</Typography>
                        <Typography sx={styles.modalSubtitle}>
                            Manually create a clock-in record for an employee
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={styles.modalCloseButton} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Employee search */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography sx={styles.clockPickerLabel}>Employee</Typography>
                    <EmployeeAutocomplete
                        value={selectedEmployee}
                        onChange={setSelectedEmployee}
                        disabled={saving}
                    />
                </Box>

                {/* Date */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Typography sx={styles.clockPickerLabel}>Date</Typography>
                    <TextField
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={saving}
                        size="small"
                        fullWidth
                        sx={styles.timeTextField}
                    />
                </Box>

                {/* Times */}
                <Box sx={styles.clockPickersRow}>
                    <Box sx={styles.clockPickerWrapper}>
                        <Typography sx={styles.clockPickerLabel}>Clock In (optional)</Typography>
                        <TextField
                            type="time"
                            value={clockIn}
                            onChange={(e) => setClockIn(e.target.value)}
                            disabled={saving}
                            size="small"
                            fullWidth
                            sx={styles.timeTextField}
                        />
                    </Box>

                    <Box sx={styles.clockPickerWrapper}>
                        <Typography sx={styles.clockPickerLabel}>Clock Out (optional)</Typography>
                        <TextField
                            type="time"
                            value={clockOut}
                            onChange={(e) => setClockOut(e.target.value)}
                            disabled={saving}
                            size="small"
                            fullWidth
                            sx={styles.timeTextField}
                        />
                    </Box>
                </Box>

                {error && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                <Box sx={styles.modalActions}>
                    <Button variant="outlined" onClick={onClose} disabled={saving} sx={styles.cancelButton}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={saving || !selectedEmployee}
                        startIcon={saving ? <CircularProgress size={16} sx={{ color: DefaultColours.white }} /> : undefined}
                        sx={styles.saveButton}
                    >
                        {saving ? "Adding..." : "Add Clock-in"}
                    </Button>
                </Box>

            </Box>
        </Modal>
    );
}

// Delete confirmation modal

interface DeleteConfirmModalProps {
    record: ClockInRecord | null;
    open: boolean;
    onClose: () => void;
    onDeleted: (clockId: string) => void;
}

function DeleteConfirmModal({ record, open, onClose, onDeleted }: DeleteConfirmModalProps) {
    const { authenticationService } = useAuth();
    const [deleting, setDeleting]   = useState(false);
    const [error, setError]         = useState<string | null>(null);

    useEffect(() => {
        if (open) setError(null);
    }, [open]);

    async function handleDelete() {
        if (!record) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteClockIn(record.clockId, authenticationService);
            onDeleted(record.clockId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setDeleting(false);
        }
    }

    if (!record) return null;

    const clockIn  = formatTime(record.clockInTime);
    const clockOut = formatTime(record.clockOutTime);

    return (
        <Modal open={open} onClose={onClose} sx={styles.modalBackdrop}>
            <Box sx={styles.modalPanel}>

                <Box sx={styles.modalHeader}>
                    <Box>
                        <Typography sx={styles.modalTitle}>Delete Clock-in</Typography>
                        <Typography sx={styles.modalSubtitle}>
                            This action cannot be undone
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={styles.modalCloseButton} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{
                    padding: "16px",
                    backgroundColor: DefaultColours.redBackgroundLight,
                    borderRadius: `${BorderRadius.mediumNotification}px`,
                    border: `1px solid ${DefaultColours.redPrimary}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                }}>
                    <Typography sx={{ ...TextStyles.medium, fontSize: FontSize.s16, color: DefaultColours.redTextDark }}>
                        Are you sure you want to delete this clock-in?
                    </Typography>
                    <Typography sx={{ ...TextStyles.regular, fontSize: FontSize.s16, color: DefaultColours.redTextDark }}>
                        {record.employeeName} · {clockIn ?? "--:--"} → {clockOut ?? "--:--"}
                    </Typography>
                    {record.report && (
                        <Typography sx={{ ...TextStyles.regular, fontSize: FontSize.xs14, color: DefaultColours.redTextDark }}>
                            The attached employee report will also be deleted.
                        </Typography>
                    )}
                </Box>

                {error && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                <Box sx={styles.modalActions}>
                    <Button variant="outlined" onClick={onClose} disabled={deleting} sx={styles.cancelButton}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDelete}
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} sx={{ color: DefaultColours.white }} /> : <DeleteOutlineIcon />}
                        sx={{ ...styles.saveButton, backgroundColor: DefaultColours.redPrimary, "&:hover": { backgroundColor: DefaultColours.redTextDark } }}
                    >
                        {deleting ? "Deleting..." : "Delete"}
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
    onDelete: (record: ClockInRecord) => void;
}

function ClockInCard({ record, onEdit, onDelete }: ClockInCardProps) {
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
                        <Typography sx={styles.metaText}>
                            Recorded on {createdDate}
                        </Typography>
                        {hasReport && (
                            <Box sx={styles.reportBadge}>
                                <WarningAmberOutlined sx={{ fontSize: "18px", color: DefaultColours.amberTextDark }} />
                                <Typography sx={styles.reportBadgeText}>Reported</Typography>
                            </Box>
                        )}
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

                    <Box sx={{ display: "flex", gap: "12px" }}>
                        <Button
                            variant="outlined"
                            startIcon={<DeleteOutlineIcon sx={{ fontSize: "20px" }} />}
                            onClick={() => onDelete(record)}
                            sx={styles.deleteButton}
                        >
                            <Typography sx={styles.deleteButtonLabel}>Delete</Typography>
                        </Button>
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
    const [showAll, setShowAll]                   = useState<boolean>(false);
    const [records, setRecords]                   = useState<ClockInRecord[]>([]);
    const [loading, setLoading]                   = useState(false);
    const [error, setError]                       = useState<string | null>(null);
    const [editingRecord, setEditingRecord]       = useState<ClockInRecord | null>(null);
    const [editModalOpen, setEditModalOpen]       = useState(false);
    const [addModalOpen, setAddModalOpen]         = useState(false);
    const [deletingRecord, setDeletingRecord]     = useState<ClockInRecord | null>(null);
    const [deleteModalOpen, setDeleteModalOpen]   = useState(false);

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
                case "date-asc":       return a.created.localeCompare(b.created);
                case "date-desc":      return b.created.localeCompare(a.created);
                case "reported-first": return (b.report ? 1 : 0) - (a.report ? 1 : 0);
                case "employee-asc":   return a.employeeName.localeCompare(b.employeeName);
                default:               return 0;
            }
        });

        return result;
    }, [records, showReportedOnly, employeeFilter, sortBy]);

    function handleEdit(record: ClockInRecord) {
        setEditingRecord(record);
        setEditModalOpen(true);
    }

    function handleDelete(record: ClockInRecord) {
        setDeletingRecord(record);
        setDeleteModalOpen(true);
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

    function handleAdded(record: ClockInRecord) {
        setRecords((prev) => [...prev, record]);
    }

    function handleDeleted(clockId: string) {
        setRecords((prev) => prev.filter((r) => r.clockId !== clockId));
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

            {/* Filters and add button row */}
            <Box sx={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
                <Box sx={{ ...styles.filtersCard, flex: 1 }}>
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
                            <Typography sx={{ fontSize: "14px", ...TextStyles.regular, color: DefaultColours.greyPrimaryMainText }}>
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

                <Button
                    variant="contained"
                    startIcon={<AddIcon sx={{ color: DefaultColours.white }} />}
                    onClick={() => setAddModalOpen(true)}
                    sx={styles.addButton}
                >
                    <Typography sx={styles.addButtonLabel}>Add Clock-in</Typography>
                </Button>
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
                    onDelete={handleDelete}
                />
            ))}

            <EditClockInModal
                record={editingRecord}
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSaved={handleSaved}
            />

            <AddClockInModal
                open={addModalOpen}
                defaultDate={selectedDate}
                onClose={() => setAddModalOpen(false)}
                onAdded={handleAdded}
            />

            <DeleteConfirmModal
                record={deletingRecord}
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onDeleted={handleDeleted}
            />
        </Box>
    );
}