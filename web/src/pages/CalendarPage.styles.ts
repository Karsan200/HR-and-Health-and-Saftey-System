import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles } from "../theme/theme";

export const calendarPageStyles = {
    // Page wrapper
    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "24px 80px 80px",
        gap: "10px",
        minHeight: "100vh",
        backgroundColor: DefaultColours.greyBackground,
    },

    // White card wrapping the calendar navigation and grid
    calendarCard: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "23px 20px",
        gap: "10px",
        backgroundColor: DefaultColours.white,
        borderRadius: "24px",
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        width: "100%",
    },

    // Navigation bar holding the prev/next buttons and month label
    navBar: {
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "center",
        alignItems: "center",
        padding: "0px 16px",
        gap: "32px",
        height: "60px",
        borderRadius: "8px",
    },

    // Red square icon button used for prev and next month navigation
    navButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "40px",
        height: "40px",
        backgroundColor: DefaultColours.redTextDark,
        borderRadius: "8px",
        cursor: "pointer",
        border: "none",
        color: DefaultColours.white,
        "&:hover": {
            backgroundColor: DefaultColours.redPrimary,
        },
    },

    // Month and year label between the navigation buttons
    navMonthLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        minWidth: "160px",
        textAlign: "center" as const,
    },

    // Outer container for the full calendar grid
    calendarGrid: {
        display: "flex",
        flexDirection: "column" as const,
        width: "100%",
        backgroundColor: DefaultColours.white,
    },

    // Row of day name headers at the top of the grid
    dayHeaderRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        width: "100%",
    },

    // Individual day name header cell
    dayHeaderCell: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px",
        height: "40px",
        backgroundColor: DefaultColours.blueLight,
        border: `1px solid ${DefaultColours.blueLight}`,
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.greyPrimaryMainText,
    },

    // Row containing seven day cells for one week
    weekRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        width: "100%",
    },

    // Standard day cell for days within the current month
    dayCell: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px",
        minHeight: "140px",
        border: `1px solid ${DefaultColours.greyBackground}`,
        backgroundColor: DefaultColours.white,
        cursor: "pointer",
        "&:hover": {
            backgroundColor: DefaultColours.greyBackground,
        },
    },

    // Day cell variant used for today's date
    dayCellToday: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px",
        minHeight: "140px",
        border: `1px solid ${DefaultColours.greyBackground}`,
        backgroundColor: DefaultColours.white,
        cursor: "pointer",
    },

    // Day cell variant for days outside the current month
    dayCellOutsideMonth: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "12px",
        minHeight: "140px",
        border: `1px solid ${DefaultColours.greyBackground}`,
        backgroundColor: DefaultColours.greyBackground,
        cursor: "default",
    },

    // Day number for a normal in-month day
    dayNumber: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
        margin: "0 auto",
    },

    // Day number for days outside the current month shown in grey
    dayNumberOutside: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.greyPrimaryMainText,
        margin: "0 auto",
    },

    // Day number for today shown as a red circle badge
    dayNumberToday: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.white,
        width: "35px",
        height: "35px",
        borderRadius: "50%",
        backgroundColor: DefaultColours.redTextDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
    },

    // Container that stacks event chips at the bottom of each day cell
    eventsContainer: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "flex-end",
        gap: "4px",
        width: "100%",
        flex: 1,
        paddingTop: "4px",
    },

    // Pill-shaped chip showing a single event in a day cell
    eventChip: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "8px",
        padding: "0px",
        height: "32px",
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: "6px",
        width: "100%",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
            opacity: 0.85,
        },
    },

    // Fixed-width wrapper for the icon circle inside an event chip
    eventIconWrap: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "32px",
        height: "32px",
        flexShrink: 0,
    },

    // Coloured circle behind the event icon, background colour passed as a param
    eventIconCircle: (bg: string) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: bg,
    }),

    // Event label text, colour passed as a param to match the event type
    eventLabel: (color: string) => ({
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
        color,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
        flex: 1,
        paddingRight: "6px",
    }),

    // Small grey label shown when a day has more events than the visible cap
    moreEventsLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
        textAlign: "center" as const,
        paddingTop: "2px",
    },
};