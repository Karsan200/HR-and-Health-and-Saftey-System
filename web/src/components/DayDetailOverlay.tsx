import { useMemo } from "react";
import {
    Box,
    Typography,
    IconButton,
    Modal,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { type CalendarEvent, eventConfigForType } from "../models/CalendarTypes";
import { type ResolvedLeaveType, findLeaveTypeByName } from "../logic/LeaveTypeService";
import { dayDetailOverlayStyles as styles } from "./DayDetailOverlay.styles";
import { DefaultColours } from "../theme/colours";

interface DayDetailOverlayProps {
    open: boolean;
    date: string | null;
    events: CalendarEvent[];
    leaveTypes: ResolvedLeaveType[];
    onClose: () => void;
}

// Formats an ISO date string like "2024-11-09" into "Thursday, November 9th"
function formatDate(iso: string): string {
    const [year, month, day] = iso.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const suffix = (n: number) => {
        if (n >= 11 && n <= 13) return "th";
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };
    return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${day}${suffix(day)}`;
}

// Single event row card inside the overlay
function EventRow({ event, leaveTypes }: { event: CalendarEvent; leaveTypes: ResolvedLeaveType[] }) {
    const { chipBg, iconCircleBg, textColor, Icon } = eventConfigForType(event.type, leaveTypes);

    // Use the matched leave type name as the label, falling back to the raw type string
    const matchedType = findLeaveTypeByName(leaveTypes, event.type);
    const typeLabel = matchedType?.name ?? event.type;

    return (
        <Box sx={styles.eventRow}>
            <Box sx={styles.eventRowInner}>
                {/* Left: coloured dot + name badge + notes */}
                <Box sx={styles.eventPrimary}>
                    <Box sx={styles.eventTitleRow}>
                        <Box sx={styles.eventDot(iconCircleBg)} />
                        <Box sx={styles.nameBadge(chipBg)}>
                            <Typography sx={styles.nameBadgeText(textColor)}>
                                {event.label}
                            </Typography>
                        </Box>
                    </Box>
                    {event.notes && (
                        <Box sx={styles.eventNotesRow}>
                            <Typography sx={styles.eventNotesText}>
                                {event.notes}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Divider */}
                <Box sx={styles.verticalDivider} />

                {/* Right: icon + type label */}
                <Box sx={styles.eventMeta}>
                    <Box sx={styles.eventIconCircle(iconCircleBg)}>
                        <Icon sx={{ fontSize: "16px", color: DefaultColours.white }} />
                    </Box>
                    <Typography sx={styles.eventTypeLabel(textColor)}>
                        {typeLabel}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export function DayDetailOverlay({ open, date, events, leaveTypes, onClose }: DayDetailOverlayProps) {
    const formattedDate = useMemo(() => (date ? formatDate(date) : ""), [date]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-label={`Events for ${formattedDate}`}
        >
            <Box sx={styles.backdrop} onClick={onClose}>
                {/* Stop clicks inside the panel from closing the modal */}
                <Box sx={styles.panel} onClick={e => e.stopPropagation()}>

                    {/* Close button row */}
                    <Box sx={styles.closeRow}>
                        <IconButton onClick={onClose} sx={styles.closeButton} aria-label="Close">
                            <Close sx={{ fontSize: "20px", color: DefaultColours.greyPrimaryMainText }} />
                        </IconButton>
                    </Box>

                    {/* Scrollable content */}
                    <Box sx={styles.content}>
                        <Typography sx={styles.dateHeading}>
                            {formattedDate}
                        </Typography>

                        {events.length === 0 ? (
                            <Typography sx={styles.emptyLabel}>
                                No events for this day.
                            </Typography>
                        ) : (
                            <Box sx={styles.eventList}>
                                {events.map(ev => (
                                    <EventRow key={ev.id} event={ev} leaveTypes={leaveTypes} />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}