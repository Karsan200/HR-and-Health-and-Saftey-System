import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles, BorderRadius } from "../theme/theme";

export const pendingRequestsPageStyles = {

    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "24px clamp(16px, 5vw, 80px) 80px",
        gap: "32px",
        minHeight: "100vh",
        backgroundColor: DefaultColours.greyBackground,
    },

    statCardsRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "flex-start",
        gap: "24px",
        width: "100%",
    },

    statCard: (highlighted: boolean) => ({
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 0px",
        gap: "10px",
        flex: 1,
        backgroundColor: DefaultColours.white,
        border: highlighted ? `1px solid ${DefaultColours.redPrimary}` : "none",
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: "24px",
        minHeight: "83px",
    }),

    statCardLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.black,
        lineHeight: "120%",
        letterSpacing: "0.17px",
        textAlign: "center" as const,
    },

    statCardBadge: {
        ml: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        backgroundColor: DefaultColours.redPrimary,
        color: DefaultColours.white,
        fontSize: FontSize.xs14,
        ...TextStyles.semiBold,
        verticalAlign: "middle",
    },

    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 0",
    },

    emptyState: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        backgroundColor: DefaultColours.white,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.mediumNotification}px`,
    },

    emptyStateText: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.redTextDark,
    },

    requestCard: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        padding: "24px",
        gap: "10px",
        backgroundColor: DefaultColours.white,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        width: "100%",
    },

    requestCardInner: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "24px",
        flex: 1,
    },

    // Context block (name + tag row + date range)
    contextBlock: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start",
        gap: "10px",
    },

    employeeName: {
        ...TextStyles.medium,
        fontSize: FontSize.xl32,
        color: DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    tagRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "10px",
    },

    leaveTypeTag: (bg: string) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        backgroundColor: bg,
        borderRadius: `${BorderRadius.mediumNotification}px`,
    }),

    leaveTypeTagText: (textColor: string) => ({
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: textColor,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    }),

    requestedOnText: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    dateRange: {
        ...TextStyles.medium,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    // Notes box
    notesBox: {
        padding: "12px 16px",
        backgroundColor: DefaultColours.white,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
        alignSelf: "flex-start",
    },

    notesHeader: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    notesIcon: {
        fontSize: "16px",
        color: DefaultColours.greyPrimaryMainText,
    },

    notesLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
    },

    notesText: (hasNotes: boolean) => ({
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: hasNotes ? DefaultColours.black : DefaultColours.greyPrimaryMainText,
        fontStyle: hasNotes ? "normal" : "italic",
    }),

    // Reason section
    reasonSection: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start",
        gap: "12px",
        width: "100%",
    },

    reasonLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    reasonTextField: {
        "& .MuiOutlinedInput-root": {
            ...TextStyles.regular,
            borderRadius: `${BorderRadius.mediumNotification}px`,
            fontSize: FontSize.xs14,
            color: DefaultColours.black,
            "& fieldset": {
                borderColor: DefaultColours.greyIconLight,
                borderWidth: "1px",
            },
            "&:hover fieldset": {
                borderColor: DefaultColours.greyPrimaryMainText,
            },
            "&.Mui-focused fieldset": {
                borderColor: DefaultColours.redPrimary,
                borderWidth: "1px",
            },
        },
        "& .MuiInputBase-input::placeholder": {
            color: DefaultColours.greyPrimaryMainText,
            opacity: 1,
            fontSize: FontSize.xs14,
        },
    },

    // Button row
    buttonRow: {
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "24px",
        width: "100%",
    },

    approveButton: {
        display: "flex",
        alignItems: "center",
        padding: "10px 24px",
        gap: "10px",
        width: "200px",
        height: "66px",
        backgroundColor: DefaultColours.greenPrimary,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        textTransform: "none" as const,
        "&:hover": {
            backgroundColor: DefaultColours.greenTextDark,
            boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        },
        "&.Mui-disabled": {
            backgroundColor: DefaultColours.greyIconLight,
        },
    },

    declineButton: {
        display: "flex",
        alignItems: "center",
        padding: "10px 24px",
        gap: "10px",
        width: "200px",
        height: "66px",
        backgroundColor: DefaultColours.redPrimary,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        textTransform: "none" as const,
        "&:hover": {
            backgroundColor: DefaultColours.redTextDark,
            boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        },
        "&.Mui-disabled": {
            backgroundColor: DefaultColours.greyIconLight,
        },
    },

    buttonLabel: {
        ...TextStyles.semiBold,
        fontSize: FontSize.m20,
        color: DefaultColours.white,
        lineHeight: "120%",
        letterSpacing: "0.17px",
    },

    buttonIcon: {
        color: DefaultColours.white,
        fontSize: "24px",
    },
};