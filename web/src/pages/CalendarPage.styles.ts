import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles } from "../theme/theme";

export const calendarPageStyles = {
    // Page wrapper
    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "clamp(12px, 3vw, 24px) clamp(16px, 5vw, 80px) clamp(40px, 5vw, 80px)",
        gap: "40px",
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

    // Centred container shown while the calendar data is loading
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 0",
    },

    // Error message shown when the calendar data request fails
    errorLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.redTextDark,
        textAlign: "center" as const,
        padding: "60px 0",
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
    },

    // Text label inside each day name header cell
    dayHeaderLabel: {
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
        alignItems: "flex-start",
        padding: "clamp(4px, 1vw, 12px)",
        minHeight: "clamp(60px, 10vw, 140px)",
        border: `1px solid ${DefaultColours.greyBackground}`,
        backgroundColor: DefaultColours.white,
        cursor: "pointer",
        gap: "clamp(2px, 0.4vw, 6px)",
        overflow: "hidden",
        "&:hover": {
            backgroundColor: DefaultColours.greyBackground,
        },
    },

    // Day cell variant used for today's date
    dayCellToday: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start",
        padding: "clamp(4px, 1vw, 12px)",
        minHeight: "clamp(60px, 10vw, 140px)",
        border: `1px solid ${DefaultColours.greyBackground}`,
        backgroundColor: DefaultColours.white,
        cursor: "pointer",
        gap: "clamp(2px, 0.4vw, 6px)",
        overflow: "hidden",
    },

    // Day cell variant for days outside the current month
    dayCellOutsideMonth: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start",
        padding: "clamp(4px, 1vw, 12px)",
        minHeight: "clamp(60px, 10vw, 140px)",
        border: `1px solid ${DefaultColours.greyBackground}`,
        backgroundColor: DefaultColours.greyBackground,
        cursor: "default",
        gap: "clamp(2px, 0.4vw, 6px)",
        overflow: "hidden",
    },

    // Day number aligned to the top left for a normal in-month day
    dayNumber: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
    },

    // Day number for days outside the current month shown in grey
    dayNumberOutside: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.greyPrimaryMainText,
    },

    // Day number for today shown as a red circle badge aligned to the top left
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
    },

    // Container that stacks event chips below the day number
    eventsContainer: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px",
        width: "100%",
    },

    // Full-width event chip with coloured background, chip colour passed as a param
    eventChip: (bg: string) => ({
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "8px",
        padding: "4px 8px",
        height: "32px",
        backgroundColor: bg,
        borderRadius: "6px",
        width: "100%",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
            opacity: 0.85,
        },
    }),

    // Coloured circle behind the event icon, background colour passed as a param
    eventIconCircle: (bg: string) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: bg,
        flexShrink: 0,
    }),

    // Event label text, colour passed as a param to match the event type
    eventLabel: (color: string) => ({
        ...TextStyles.semiBold,
        fontSize: FontSize.xs14,
        color,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
        flex: 1,
    }),

    // Small grey label shown when a day has more events than the visible cap
    moreEventsLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
        paddingLeft: "4px",
        paddingTop: "2px",
    },

    // Wrapper inside the tooltip that stacks the name and notes vertically
    tooltipContent: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px",
        padding: "2px 0",
    },

    // Bold name line at the top of the tooltip
    tooltipLabel: {
        ...TextStyles.semiBold,
        fontSize: FontSize.xs14,
        color: DefaultColours.white,
    },

    // Lighter notes line below the name in the tooltip
    tooltipNotes: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyIconLight,
    },

    // Row of key items shown below the calendar grid
    keyRow: {
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "center",
        alignItems: "center",
        gap: "32px",
        paddingTop: "16px",
        paddingBottom: "8px",
        borderTop: `1px solid ${DefaultColours.greyBackground}`,
    },

    // Single key item containing an icon circle and label
    keyItem: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "8px",
    },

    // Label text for each key item, colour passed as a param to match the event type
    keyLabel: (color: string) => ({
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color,
    }),
};