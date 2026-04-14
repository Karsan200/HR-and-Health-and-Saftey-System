import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles, BorderRadius } from "../theme/theme";

export const clockOverridesPageStyles = {

    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        padding: "24px clamp(16px, 5vw, 80px) 80px",
        gap: "32px",
        minHeight: "100vh",
        backgroundColor: DefaultColours.greyBackground,
    },

    filtersCard: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        flexWrap: "wrap" as const,
        gap: "16px",
        padding: "20px 24px",
        backgroundColor: DefaultColours.white,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.mediumNotification}px`,
    },

    filterField: {
        "& .MuiOutlinedInput-root": {
            ...TextStyles.regular,
            fontSize: FontSize.s16,
            color: DefaultColours.black,
            backgroundColor: DefaultColours.white,
            borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
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
        "& .MuiInputLabel-root": {
            ...TextStyles.regular,
            fontSize: FontSize.s16,
            color: DefaultColours.greyPrimaryMainText,
            "&.Mui-focused": {
                color: DefaultColours.redPrimary,
            },
        },
        "& .MuiSelect-select": {
            ...TextStyles.regular,
            fontSize: FontSize.s16,
        },
    },

    filterDivider: {
        width: "1px",
        height: "32px",
        backgroundColor: DefaultColours.greyIconLight,
        flexShrink: 0,
    },

    resultSummary: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
        marginLeft: "auto",
        whiteSpace: "nowrap" as const,
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
        gap: "12px",
    },

    emptyStateText: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
    },

    emptyStateSubtext: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyIconLight,
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.redTextDark,
    },

    clockInCard: (hasReport: boolean) => ({
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        padding: "24px",
        gap: "24px",
        backgroundColor: DefaultColours.white,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        borderLeft: hasReport
            ? `4px solid ${DefaultColours.amberPrimary}`
            : `4px solid transparent`,
        width: "100%",
    }),

    cardInner: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "16px",
        flex: 1,
    },

    cardTopRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap" as const,
    },

    employeeBlock: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
    },

    employeeName: {
        ...TextStyles.medium,
        fontSize: FontSize.xl32,
        color: DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    metaText: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    reportBadge: {
        display: "inline-flex",
        flexDirection: "row" as const,
        alignItems: "center",
        alignSelf: "flex-start",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: DefaultColours.amberBackgroundLight,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.amberPrimary}`,
        width: "fit-content",
    },

    reportBadgeText: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: DefaultColours.amberTextDark,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    timesRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "32px",
        flexWrap: "wrap" as const,
    },

    timeBlock: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px",
    },

    timeLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    },

    timeValue: (missing: boolean) => ({
        ...TextStyles.medium,
        fontSize: FontSize.l24,
        color: missing ? DefaultColours.greyIconLight : DefaultColours.black,
        lineHeight: "143%",
        letterSpacing: "0.17px",
    }),

    reportIssueBox: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px",
        padding: "14px 16px",
        backgroundColor: DefaultColours.amberBackgroundLight,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.amberPrimary}`,
    },

    reportIssueLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.amberTextDark,
        letterSpacing: "0.17px",
    },

    reportIssueText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.amberTextDark,
        letterSpacing: "0.17px",
    },

    addButton: {
        height: "auto",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        padding: "10px 24px",
        gap: "10px",
        minWidth: "180px",
        backgroundColor: DefaultColours.greenPrimary,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        textTransform: "none" as const,
        flexShrink: 0,
        "&:hover": {
            backgroundColor: DefaultColours.greenTextDark,
            boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        },
    },

    addButtonLabel: {
        ...TextStyles.semiBold,
        fontSize: FontSize.m20,
        color: DefaultColours.white,
        lineHeight: "120%",
        letterSpacing: "0.17px",
    },

    deleteButton: {
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        gap: "8px",
        height: "66px",
        minWidth: "120px",
        borderColor: DefaultColours.redPrimary,
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        textTransform: "none" as const,
        "&:hover": {
            borderColor: DefaultColours.redTextDark,
            backgroundColor: DefaultColours.redBackgroundLight,
        },
    },

    deleteButtonLabel: {
        ...TextStyles.semiBold,
        fontSize: FontSize.m20,
        color: DefaultColours.redPrimary,
        lineHeight: "120%",
        letterSpacing: "0.17px",
    },

    editButton: {
        display: "flex",
        alignItems: "center",
        padding: "10px 24px",
        gap: "10px",
        height: "66px",
        minWidth: "160px",
        backgroundColor: DefaultColours.redPrimary,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        textTransform: "none" as const,
        "&:hover": {
            backgroundColor: DefaultColours.redTextDark,
            boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        },
    },

    editButtonLabel: {
        ...TextStyles.semiBold,
        fontSize: FontSize.m20,
        color: DefaultColours.white,
        lineHeight: "120%",
        letterSpacing: "0.17px",
    },

    modalBackdrop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
    },

    modalPanel: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "24px",
        backgroundColor: DefaultColours.white,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        padding: "32px",
        width: "100%",
        maxWidth: "560px",
        boxShadow: `0px 8px 32px rgba(0, 0, 0, 0.12)`,
        outline: "none",
        maxHeight: "90vh",
        overflowY: "auto" as const,
    },

    modalHeader: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    modalTitle: {
        ...TextStyles.medium,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
        letterSpacing: "0.17px",
    },

    modalSubtitle: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyPrimaryMainText,
        marginTop: "4px",
    },

    modalCloseButton: {
        color: DefaultColours.greyPrimaryMainText,
        "&:hover": {
            backgroundColor: DefaultColours.greyBackground,
        },
    },

    reportPanel: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px",
        padding: "16px",
        backgroundColor: DefaultColours.amberBackgroundLight,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.amberPrimary}`,
    },

    reportPanelTitle: {
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
        color: DefaultColours.amberTextDark,
    },

    reportPanelText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.amberTextDark,
    },

    dismissReportRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: DefaultColours.amberBackgroundLight,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.amberPrimary}`,
    },

    dismissReportLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.amberTextDark,
        letterSpacing: "0.17px",
    },

    clockPickersRow: {
        display: "flex",
        flexDirection: "row" as const,
        gap: "16px",
        alignItems: "flex-start",
        flexWrap: "wrap" as const,
    },

    clockPickerWrapper: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px",
        flex: 1,
        minWidth: "200px",
    },

    clockPickerLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        letterSpacing: "0.17px",
    },

    timeTextField: {
        "& .MuiOutlinedInput-root": {
            ...TextStyles.regular,
            fontSize: FontSize.s16,
            color: DefaultColours.black,
            borderRadius: `${BorderRadius.mediumNotification}px`,
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
        "& .MuiInputBase-input": {
            fontFamily: "Poppins, sans-serif",
            fontSize: FontSize.s16,
        },
    },

    modalActions: {
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "flex-end",
        gap: "12px",
    },

    cancelButton: {
        padding: "10px 24px",
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        textTransform: "none" as const,
        color: DefaultColours.greyPrimaryMainText,
        borderColor: DefaultColours.greyIconLight,
        "&:hover": {
            borderColor: DefaultColours.greyPrimaryMainText,
            backgroundColor: DefaultColours.greyBackground,
        },
    },

    saveButton: {
        padding: "10px 24px",
        borderRadius: `${BorderRadius.largeButtonsAndOutlines}px`,
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
        textTransform: "none" as const,
        backgroundColor: DefaultColours.redPrimary,
        color: DefaultColours.white,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        "&:hover": {
            backgroundColor: DefaultColours.redTextDark,
            boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        },
        "&.Mui-disabled": {
            backgroundColor: DefaultColours.greyIconLight,
            color: DefaultColours.white,
        },
    },
};