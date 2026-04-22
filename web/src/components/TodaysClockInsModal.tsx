import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    Modal,
    IconButton,
    CircularProgress,
    Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

import { useAuth } from "../AuthContext";
import {
    fetchTodaysClockIns,
    formatDateTime,
    type TodaysClockInEntry,
} from "../logic/ClockOverridesService";
import { todaysClockInsModalStyles as styles } from "./TodaysClockInsModal.styles";


/**
 * Returns a two-letter initials string from a full name.
 * Uses the first letter of the first and last words in the name.
 */
function initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
        parts[0].charAt(0).toUpperCase() +
        parts[parts.length - 1].charAt(0).toUpperCase()
    );
}

// ─── Employee row ─────────────────────────────────────────────────────────────

interface EmployeeRowProps {
    entry: TodaysClockInEntry;
}

function EmployeeRow({ entry }: EmployeeRowProps) {
    const [expanded, setExpanded] = useState(false);

    const firstTime  = formatDateTime(entry.firstOnSite?.timestamp ?? null);
    const lastTime   = entry.lastOnSite ? formatDateTime(entry.lastOnSite.timestamp) : null;
    const eventCount = entry.allEvents.length;

    return (
        <Box sx={styles.employeeRow}>
            {/* Clickable summary row */}
            <Box onClick={() => setExpanded((prev) => !prev)} sx={styles.employeeRowSummary}>

                {/* Avatar */}
                <Box sx={styles.avatar}>
                    <Typography sx={styles.avatarText}>
                        {initials(entry.employeeName)}
                    </Typography>
                </Box>

                {/* Name + event count */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={styles.employeeNameText}>
                        {entry.employeeName}
                    </Typography>
                    <Typography sx={styles.employeeEventCount}>
                        {eventCount} {eventCount === 1 ? "event" : "events"} today
                    </Typography>
                </Box>

                {/* First / Last on site chips */}
                <Box sx={styles.timeChipsRow}>
                    <Box sx={styles.timeChip}>
                        <AccessTimeOutlinedIcon sx={styles.timeChipIcon(true)} />
                        <Box>
                            <Typography sx={styles.timeChipLabel}>First on site</Typography>
                            <Typography sx={styles.timeChipValue}>{firstTime}</Typography>
                        </Box>
                    </Box>

                    {lastTime && (
                        <Box sx={styles.timeChip}>
                            <AccessTimeOutlinedIcon sx={styles.timeChipIcon(false)} />
                            <Box>
                                <Typography sx={styles.timeChipLabel}>Last on site</Typography>
                                <Typography sx={styles.timeChipValue}>{lastTime}</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Expand / collapse chevron */}
                <Box sx={styles.chevronIcon}>
                    {expanded
                        ? <KeyboardArrowUpIcon sx={styles.chevronIcon} />
                        : <KeyboardArrowDownIcon sx={styles.chevronIcon} />
                    }
                </Box>
            </Box>

            {/* Expanded event list */}
            <Collapse in={expanded} unmountOnExit>
                <Box sx={styles.expandedPanel}>
                    <Typography sx={styles.expandedPanelHeading}>
                        All clock-in events
                    </Typography>

                    {entry.allEvents.map((event, index) => {
                        const isFirst = index === 0;
                        const isLast  = index === entry.allEvents.length - 1 && entry.allEvents.length > 1;

                        return (
                            <Box key={event.eventId} sx={styles.eventRow}>
                                <Box sx={styles.eventNumberPill}>
                                    <Typography sx={styles.eventNumberText}>
                                        {index + 1}
                                    </Typography>
                                </Box>

                                <AccessTimeOutlinedIcon sx={styles.eventTimeIcon} />

                                <Typography sx={styles.eventTimeText}>
                                    {formatDateTime(event.timestamp)}
                                </Typography>

                                {isFirst && (
                                    <Box sx={styles.firstOnSitePill}>
                                        <Typography sx={styles.firstOnSitePillText}>
                                            First on site
                                        </Typography>
                                    </Box>
                                )}

                                {isLast && (
                                    <Box sx={styles.lastOnSitePill(isFirst)}>
                                        <Typography sx={styles.lastOnSitePillText}>
                                            Last on site
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Collapse>
        </Box>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface TodaysClockInsModalProps {
    open: boolean;
    onClose: () => void;
}

export function TodaysClockInsModal({ open, onClose }: TodaysClockInsModalProps) {
    const { authenticationService } = useAuth();

    const [entries, setEntries] = useState<TodaysClockInEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTodaysClockIns(authenticationService);
            setEntries(data);
        } catch {
            setError("Failed to load today's clock-in events. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [authenticationService]);

    useEffect(() => {
        if (open) void load();
    }, [open, load]);

    const todayLabel = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <Modal open={open} onClose={onClose} sx={styles.modalBackdrop}>
            <Box sx={styles.modalPanel}>

                {/* Header */}
                <Box sx={styles.modalHeader}>
                    <Box>
                        <Typography sx={styles.modalTitle}>Today's Clock-ins</Typography>
                        <Typography sx={styles.modalSubtitle}>{todayLabel}</Typography>
                    </Box>
                    <IconButton onClick={onClose} aria-label="Close" sx={styles.closeButton}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Summary badge */}
                {!loading && !error && (
                    <Box sx={styles.summaryBadge}>
                        <PeopleOutlineIcon sx={styles.summaryBadgeIcon} />
                        <Typography sx={styles.summaryBadgeText}>
                            <Box component="span" sx={styles.summaryBadgeCount}>
                                {entries.length}
                            </Box>
                            {" "}
                            {entries.length === 1 ? "employee" : "employees"} on site today
                        </Typography>
                    </Box>
                )}

                {/* Loading */}
                {loading && (
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {/* Error */}
                {!loading && error && (
                    <Typography sx={styles.errorText}>{error}</Typography>
                )}

                {/* Empty state */}
                {!loading && !error && entries.length === 0 && (
                    <Box sx={styles.emptyState}>
                        <PeopleOutlineIcon sx={styles.emptyStateIcon} />
                        <Typography sx={styles.emptyStateTitle}>
                            No employees on site yet
                        </Typography>
                        <Typography sx={styles.emptyStateSubtext}>
                            Clock-in events will appear here as employees arrive
                        </Typography>
                    </Box>
                )}

                {/* Employee list */}
                {!loading && !error && entries.length > 0 && (
                    <Box sx={styles.employeeList}>
                        {entries.map((entry) => (
                            <EmployeeRow key={entry.accountId} entry={entry} />
                        ))}
                    </Box>
                )}

            </Box>
        </Modal>
    );
}