import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles } from "../theme/theme";

export const dayDetailOverlayStyles = {
    // Full-screen semi-transparent backdrop — centres the panel
    backdrop: {
        position: "fixed" as const,
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 1300,
    },

    // White panel — max width keeps it readable on wide screens
    panel: {
        backgroundColor: DefaultColours.white,
        borderRadius: "16px",
        width: "100%",
        maxWidth: "700px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column" as const,
        overflow: "hidden",
    },

    // Row at the top that holds just the close button, right-aligned
    closeRow: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "10px 16px",
        flexShrink: 0,
    },

    // Close icon button
    closeButton: {
        width: "32px",
        height: "32px",
        padding: 0,
        borderRadius: "6px",
        "&:hover": {
            backgroundColor: DefaultColours.greyBackground,
        },
    },

    // Scrollable content area below the close row
    content: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "0px 40px 40px",
        gap: "24px",
        overflowY: "auto" as const,
    },

    // Large bold date heading
    dateHeading: {
        ...TextStyles.semiBold,
        fontSize: FontSize.xl32,
        color: DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    // Stacked list of event row cards
    eventList: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "16px",
    },

    // Card wrapping a single event row
    eventRow: {
        backgroundColor: DefaultColours.white,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: "12px",
        padding: "10px 0",
    },

    // Inner flex row: primary info | divider | meta
    eventRowInner: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        padding: "8px 16px",
        gap: "20px",
    },

    // Left section: dot + badge + notes
    eventPrimary: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
        flex: 1,
        minWidth: 0,
    },

    // Row containing the coloured dot and the name badge
    eventTitleRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "8px",
    },

    // Coloured dot for event type, colour passed as param
    eventDot: (color: string) => ({
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
    }),

    // Pill badge containing the employee name, background colour passed as param
    nameBadge: (bg: string) => ({
        backgroundColor: bg,
        borderRadius: "6px",
        padding: "1px 10px",
        display: "flex",
        alignItems: "center",
    }),

    // Text inside the name badge, colour passed as param
    nameBadgeText: (color: string) => ({
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color,
        letterSpacing: "0.17px",
        lineHeight: "143%",
    }),

    // Row for the notes/description below the name badge
    eventNotesRow: {
        paddingLeft: "18px",
    },

    // Notes text
    eventNotesText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.black,
        letterSpacing: "0.17px",
        lineHeight: "143%",
    },

    // Thin vertical line separating the primary info from meta
    verticalDivider: {
        width: "1px",
        alignSelf: "stretch",
        backgroundColor: DefaultColours.greyBackground,
        flexShrink: 0,
    },

    // Right section: icon circle + type label
    eventMeta: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "10px",
        minWidth: "140px",
        flexShrink: 0,
    },

    // Coloured circle around the event icon, colour passed as param
    eventIconCircle: (bg: string) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        backgroundColor: bg,
        flexShrink: 0,
    }),

    // Human-readable type label (e.g. "Sick Leave"), colour passed as param
    eventTypeLabel: (color: string) => ({
        ...TextStyles.semiBold,
        fontSize: FontSize.xs14,
        color,
        letterSpacing: "0.17px",
    }),

    // Shown when there are no events for the selected day
    emptyLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyPrimaryMainText,
        paddingTop: "8px",
    },
};