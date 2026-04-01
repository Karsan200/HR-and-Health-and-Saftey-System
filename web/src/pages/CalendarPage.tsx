import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    ChevronLeft,
    ChevronRight,
    BeachAccessOutlined,
    SickOutlined,
    EventAvailableOutlined,
    SchoolOutlined,
} from "@mui/icons-material";

import { calendarPageStyles as styles } from "./CalendarPage.styles";
import { SectionNavBar, type SectionNavTab } from "../components/SectionNavbar";
import { DefaultColours } from "../theme/colours.ts";

// Tabs shown at the top of the calendar section
const CALENDAR_TABS: SectionNavTab[] = [
    { label: "Calendar View",    route: "/calendar",           alert: true },
    { label: "Pending Requests", route: "/calendar/requests" },
    { label: "Clock Overrides",  route: "/calendar/overrides" },
];

// Types for calendar events
export type CalendarEventType = "nationalHoliday" | "sickLeave" | "bookedLeave" | "trainingLeave";

export interface CalendarEvent {
    id: string;
    date: string;
    type: CalendarEventType;
    label: string;
    notes?: string;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Describes each entry shown in the calendar key at the bottom
const KEY_ITEMS: { type: CalendarEventType; label: string }[] = [
    { type: "nationalHoliday", label: "National Holiday" },
    { type: "sickLeave",       label: "Sick Leave" },
    { type: "bookedLeave",     label: "Booked Leave" },
    { type: "trainingLeave",   label: "Training Leave" },
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

// Returns icon, chip background, icon circle background and text colour for each event type
function eventConfig(type: CalendarEventType): {
    chipBg: string;
    iconCircleBg: string;
    textColor: string;
    Icon: React.ElementType;
} {
    switch (type) {
        case "nationalHoliday":
            return {
                chipBg: DefaultColours.blueLight,
                iconCircleBg: DefaultColours.bluePrimary,
                textColor: DefaultColours.blueDark,
                Icon: BeachAccessOutlined,
            };
        case "sickLeave":
            return {
                chipBg: DefaultColours.redBackgroundLight,
                iconCircleBg: DefaultColours.redPrimary,
                textColor: DefaultColours.redTextDark,
                Icon: SickOutlined,
            };
        case "bookedLeave":
            return {
                chipBg: DefaultColours.amberBackgroundLight,
                iconCircleBg: DefaultColours.amberPrimary,
                textColor: DefaultColours.amberTextDark,
                Icon: EventAvailableOutlined,
            };
        case "trainingLeave":
            return {
                chipBg: DefaultColours.greenBackgroundLight,
                iconCircleBg: DefaultColours.greenPrimary,
                textColor: DefaultColours.greenTextDark,
                Icon: SchoolOutlined,
            };
    }
}

// Builds the tooltip content showing the name and optional notes
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
interface EventChipProps {
    event: CalendarEvent;
}

function EventChip({ event }: EventChipProps) {
    const { chipBg, iconCircleBg, textColor, Icon } = eventConfig(event.type);
    return (
        <Tooltip
            title={<TooltipContent label={event.label} notes={event.notes} />}
            placement="top"
            arrow
        >
            <Box sx={styles.eventChip(chipBg)}>
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

// Renders the colour key row at the bottom of the calendar
function CalendarKey() {
    return (
        <Box sx={styles.keyRow}>
            {KEY_ITEMS.map(({ type, label }) => {
                const { chipBg, iconCircleBg, textColor, Icon } = eventConfig(type);
                return (
                    <Box key={type} sx={styles.keyItem}>
                        <Box sx={styles.eventIconCircle(chipBg)}>
                            <Icon sx={{ fontSize: "14px", color: iconCircleBg }} />
                        </Box>
                        <Typography sx={styles.keyLabel(textColor)}>
                            {label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

// Props for the main calendar page
interface CalendarPageProps {
    events?: CalendarEvent[];
    onDayClick?: (date: string) => void;
    onEventClick?: (event: CalendarEvent) => void;
}

export function CalendarPage({
                                 events = SAMPLE_EVENTS,
                                 onDayClick,
                                 onEventClick,
                             }: CalendarPageProps) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const weeks = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

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

    function prevMonth() {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    }

    const todayISO = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

    return (
        <Box sx={styles.pageContainer}>
            {/* Section navigation shared across all calendar sub-pages */}
            <SectionNavBar tabs={CALENDAR_TABS} />

            {/* Main calendar card containing navigation and the day grid */}
            <Box sx={styles.calendarCard}>

                {/* Month navigation bar with prev/next buttons */}
                <Box sx={styles.navBar}>
                    <IconButton
                        sx={styles.navButton}
                        onClick={prevMonth}
                        aria-label="Previous month"
                    >
                        <ChevronLeft sx={{ color: DefaultColours.white }} />
                    </IconButton>

                    <Typography sx={styles.navMonthLabel}>
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </Typography>

                    <IconButton
                        sx={styles.navButton}
                        onClick={nextMonth}
                        aria-label="Next month"
                    >
                        <ChevronRight sx={{ color: DefaultColours.white }} />
                    </IconButton>
                </Box>

                {/* Grid of day cells organised into weeks */}
                <Box sx={styles.calendarGrid}>

                    {/* Day of week header row */}
                    <Box sx={styles.dayHeaderRow}>
                        {DAYS.map(d => (
                            <Box key={d} sx={styles.dayHeaderCell}>
                                <Typography sx={styles.dayHeaderLabel}>
                                    {d}
                                </Typography>
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
                                        onClick={() => isCurrentMonth && onDayClick?.(iso)}
                                    >
                                        {/* Day number in the top left, styled for today and out-of-month days */}
                                        <Box sx={numSx}>
                                            {date.getDate()}
                                        </Box>

                                        {/* Event chips stacked below the day number */}
                                        <Box sx={styles.eventsContainer}>
                                            {visibleEvents.map(ev => (
                                                <Box
                                                    key={ev.id}
                                                    onClick={e => { e.stopPropagation(); onEventClick?.(ev); }}
                                                >
                                                    <EventChip event={ev} />
                                                </Box>
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

                {/* Colour key explaining each event type */}
                <CalendarKey />
            </Box>
        </Box>
    );
}

// Sample events used during development, replace with real API data
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, "0");

const SAMPLE_EVENTS: CalendarEvent[] = [
    { id: "1",  date: `${y}-${m}-01`, type: "nationalHoliday", label: "New Year's Day" },
    { id: "2",  date: `${y}-${m}-04`, type: "sickLeave",       label: "Maggie M",  notes: "Flu symptoms and doctor advised rest." },
    { id: "3",  date: `${y}-${m}-08`, type: "bookedLeave",     label: "Doug G",    notes: "Family holiday booked earlier this year." },
    { id: "4",  date: `${y}-${m}-10`, type: "trainingLeave",   label: "Maggie M" },
    { id: "5",  date: `${y}-${m}-10`, type: "sickLeave",       label: "Doug G",    notes: "Family emergency." },
    { id: "6",  date: `${y}-${m}-14`, type: "bookedLeave",     label: "Maggie M",  notes: "Trip abroad planned." },
    { id: "7",  date: `${y}-${m}-17`, type: "trainingLeave",   label: "Doug G" },
    { id: "8",  date: `${y}-${m}-18`, type: "nationalHoliday", label: "Bank Holiday" },
    { id: "9",  date: `${y}-${m}-21`, type: "sickLeave",       label: "Maggie M",  notes: "Personal time off requested." },
    { id: "11", date: `${y}-${m}-29`, type: "trainingLeave",   label: "Maggie M" },
];