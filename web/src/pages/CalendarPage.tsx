import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import {
    ChevronLeft,
    ChevronRight,
} from "@mui/icons-material";

import { calendarPageStyles as styles } from "./CalendarPage.styles";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { DefaultColours } from "../theme/colours";
import { fetchCalendarEvents } from "../logic/LeaveCalendarService";
import { fetchPendingLeaveCount } from "../logic/PendingRequestsService";
import { fetchLeaveTypes, type ResolvedLeaveType } from "../logic/LeaveTypeService";
import { useAuth } from "../AuthContext";
import { DayDetailOverlay } from "../components/DayDetailOverlay";
import { type CalendarEvent, eventConfigForType } from "../models/CalendarTypes";
import { fetchReportedClockInCount } from "../logic/ClockOverridesService";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Converts year, month, day into an ISO date string
function toISODate(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Builds a Monday-first grid of weeks for the given year and month
function buildCalendarGrid(year: number, month: number): Date[][] {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Date[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
        cells.push(new Date(year, month - 1, prevMonthDays - i));
    }

    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(year, month, d));
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
        for (let d = 1; d <= 7 - remainder; d++) {
            cells.push(new Date(year, month + 1, d));
        }
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

function TooltipContent({ label, notes }: { label: string; notes?: string }) {
    return (
        <Box sx={styles.tooltipContent}>
            <Typography sx={styles.tooltipLabel}>{label}</Typography>
            {notes && (
                <Typography sx={styles.tooltipNotes}>{notes}</Typography>
            )}
        </Box>
    );
}

// Renders a single full-width coloured event chip inside a calendar day cell
function EventChip({
                       event,
                       leaveTypes,
                       onEventClick,
                   }: {
    event: CalendarEvent;
    leaveTypes: ResolvedLeaveType[];
    onEventClick?: (e: CalendarEvent) => void;
}) {
    const { chipBg, iconCircleBg, textColor, Icon } = eventConfigForType(event.type, leaveTypes);
    return (
        <Tooltip
            title={<TooltipContent label={event.label} notes={event.notes} />}
            placement="top"
            arrow
        >
            <Box
                sx={styles.eventChip(chipBg)}
                onClick={e => { e.stopPropagation(); onEventClick?.(event); }}
            >
                <Box sx={styles.eventIconCircle(iconCircleBg)}>
                    <Icon sx={{ fontSize: "14px", color: DefaultColours.white }} />
                </Box>
                <Typography sx={styles.eventLabel(textColor)}>
                    {event.label}
                </Typography>
            </Box>
        </Tooltip>
    );
}

// Renders the colour key row at the bottom of the calendar, one entry per leave type
function CalendarKey({ leaveTypes }: { leaveTypes: ResolvedLeaveType[] }) {
    if (leaveTypes.length === 0) return null;

    return (
        <Box sx={styles.keyRow}>
            {leaveTypes.map((lt) => {
                const { chipBg, iconCircleBg, Icon } = eventConfigForType(lt.name, leaveTypes);
                return (
                    <Box key={lt.leaveTypeId} sx={styles.keyItem}>
                        <Box sx={styles.eventIconCircle(chipBg)}>
                            <Icon sx={{ fontSize: "14px", color: iconCircleBg }} />
                        </Box>
                        <Typography sx={styles.keyLabel(iconCircleBg)}>
                            {lt.name}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

// Props for the main calendar page
interface CalendarPageProps {
    onEventClick?: (event: CalendarEvent) => void;
}

export function CalendarPage({ onEventClick }: CalendarPageProps) {
    const auth = useAuth();

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [leaveTypes, setLeaveTypes] = useState<ResolvedLeaveType[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [reportedCount, setReportedCount] = useState<number>(0);

    const [overlayDate, setOverlayDate] = useState<string | null>(null);
    const [overlayOpen, setOverlayOpen] = useState(false);

    const weeks = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

    // Fetch leave types once on mount — drives chip colours and the calendar key
    const loadLeaveTypes = useCallback(async () => {
        try {
            const data = await fetchLeaveTypes(auth.authenticationService);
            setLeaveTypes(data);
        } catch {
            // Non-critical — chips fall back to grey if this fails
        }
    }, [auth.authenticationService]);

    useEffect(() => {
        loadLeaveTypes();
    }, [loadLeaveTypes]);

    // Fetch events from the backend whenever the viewed month changes
    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCalendarEvents(viewYear, viewMonth + 1, auth.authenticationService);
            setEvents(data);
        } catch {
            setError("Failed to load calendar data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [viewYear, viewMonth, auth.authenticationService]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Fetch the pending request count once on mount for the nav badge
    const loadPendingCount = useCallback(async () => {
        try {
            const count = await fetchPendingLeaveCount(auth.authenticationService);
            setPendingCount(count);
        } catch {
            // Non-critical — badge stays at 0 if the request fails
        }
    }, [auth.authenticationService]);

    useEffect(() => {
        loadPendingCount();
    }, [loadPendingCount]);

    // Fetch the reported clock-in count once on mount for the nav badge
    const loadReportedCount = useCallback(async () => {
        try {
            const count = await fetchReportedClockInCount(auth.authenticationService);
            setReportedCount(count);
        } catch {
            // Non-critical — badge stays at 0 if the request fails
        }
    }, [auth.authenticationService]);

    useEffect(() => {
        loadReportedCount();
    }, [loadReportedCount]);

    // Index events by date string for fast lookup per day cell
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const ev of events) {
            const arr = map.get(ev.date) ?? [];
            arr.push(ev);
            map.set(ev.date, arr);
        }
        return map;
    }, [events]);

    const overlayEvents = useMemo(
        () => (overlayDate ? (eventsByDate.get(overlayDate) ?? []) : []),
        [overlayDate, eventsByDate],
    );

    function handleDayClick(iso: string) {
        setOverlayDate(iso);
        setOverlayOpen(true);
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    }

    const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

    // Built inside the component so pendingCount and reportedCount stay live
    const calendarTabs: SectionNavTab[] = [
        { label: "Calendar View",    route: "/calendar", alert: true },
        { label: "Pending Requests", route: "/calendar/requests", count: pendingCount },
        { label: "Clock Overrides",  route: "/calendar/overrides", count: reportedCount },
    ];

    return (
        <Box sx={styles.pageContainer}>
            {/* Section navigation shared across all calendar sub-pages */}
            <SectionNavBar tabs={calendarTabs} />

            {/* Main calendar card containing navigation and the day grid */}
            <Box sx={styles.calendarCard}>

                {/* Month navigation bar with prev/next buttons */}
                <Box sx={styles.navBar}>
                    <IconButton sx={styles.navButton} onClick={prevMonth} aria-label="Previous month">
                        <ChevronLeft sx={{ color: DefaultColours.white }} />
                    </IconButton>

                    <Typography sx={styles.navMonthLabel}>
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </Typography>
                    <IconButton sx={styles.navButton} onClick={nextMonth} aria-label="Next month">
                        <ChevronRight sx={{ color: DefaultColours.white }} />
                    </IconButton>
                </Box>

                {/* Loading spinner shown while calendar data is being fetched */}
                {loading && (
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress size={32} sx={{ color: DefaultColours.redTextDark }} />
                    </Box>
                )}

                {/* Error message shown when the calendar data request fails */}
                {!loading && error && (
                    <Typography sx={styles.errorLabel}>{error}</Typography>
                )}

                {/* Grid of day cells organised into weeks */}
                {!loading && !error && (
                    <Box sx={styles.calendarGrid}>

                        {/* Day of week header row */}
                        <Box sx={styles.dayHeaderRow}>
                            {DAYS.map(d => (
                                <Box key={d} sx={styles.dayHeaderCell}>
                                    <Typography sx={styles.dayHeaderLabel}>{d}</Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* One row per week, seven cells per row */}
                        {weeks.map((week, wi) => (
                            <Box key={wi} sx={styles.weekRow}>
                                {week.map((date, di) => {
                                    const isCurrentMonth = date.getMonth() === viewMonth;
                                    const iso = toISODate(date.getFullYear(), date.getMonth(), date.getDate());
                                    const isToday = iso === todayISO;
                                    const dayEvents = eventsByDate.get(iso) ?? [];
                                    const MAX_VISIBLE = 2;
                                    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
                                    const overflow = dayEvents.length - MAX_VISIBLE;

                                    const cellSx = !isCurrentMonth
                                        ? styles.dayCellOutsideMonth
                                        : isToday
                                            ? styles.dayCellToday
                                            : styles.dayCell;

                                    const numSx = !isCurrentMonth
                                        ? styles.dayNumberOutside
                                        : isToday
                                            ? styles.dayNumberToday
                                            : styles.dayNumber;

                                    return (
                                        <Box
                                            key={di}
                                            sx={cellSx}
                                            onClick={() => isCurrentMonth && handleDayClick(iso)}
                                        >
                                            <Box sx={numSx}>{date.getDate()}</Box>
                                            <Box sx={styles.eventsContainer}>
                                                {visibleEvents.map(ev => (
                                                    <EventChip
                                                        key={ev.id}
                                                        event={ev}
                                                        leaveTypes={leaveTypes}
                                                        onEventClick={onEventClick}
                                                    />
                                                ))}
                                                {overflow > 0 && (
                                                    <Typography sx={styles.moreEventsLabel}>
                                                        +{overflow} more
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}
                    </Box>
                )}

                <CalendarKey leaveTypes={leaveTypes} />
            </Box>

            <DayDetailOverlay
                open={overlayOpen}
                date={overlayDate}
                events={overlayEvents}
                leaveTypes={leaveTypes}
                onClose={() => setOverlayOpen(false)}
            />
        </Box>
    );
}