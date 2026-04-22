import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles, BorderRadius } from "../theme/theme";

export const todaysClockInsModalStyles = {

    modalBackdrop: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
    },

    modalPanel: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "20px",
        backgroundColor: DefaultColours.white,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        padding: "32px",
        width: "100%",
        maxWidth: "680px",
        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.12)",
        outline: "none",
        maxHeight: "85vh",
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

    closeButton: {
        color: DefaultColours.greyPrimaryMainText,
        "&:hover": {
            backgroundColor: DefaultColours.greyBackground,
        },
    },

    summaryBadge: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.greyIconLight}`,
    },

    summaryBadgeIcon: {
        fontSize: "20px",
        color: DefaultColours.greyPrimaryMainText,
    },

    summaryBadgeText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyPrimaryMainText,
    },

    summaryBadgeCount: {
        ...TextStyles.semiBold,
        color: DefaultColours.black,
    },

    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px 0",
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.redTextDark,
    },

    emptyState: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "12px",
        padding: "48px 0",
    },

    emptyStateIcon: {
        fontSize: "40px",
        color: DefaultColours.greyIconLight,
    },

    emptyStateTitle: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
    },

    emptyStateSubtext: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyIconLight,
    },

    employeeList: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "10px",
    },

    // Employee row

    employeeRow: {
        backgroundColor: DefaultColours.white,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        overflow: "hidden",
        transition: "box-shadow 0.15s ease",
        "&:hover": {
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        },
    },

    employeeRowSummary: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        cursor: "pointer",
        userSelect: "none" as const,
    },

    avatar: {
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        backgroundColor: DefaultColours.greyBackground,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    avatarText: {
        ...TextStyles.semiBold,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1,
    },

    employeeNameText: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        lineHeight: "143%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
    },

    employeeEventCount: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: "143%",
    },

    timeChipsRow: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexShrink: 0,
        flexWrap: "wrap" as const,
        justifyContent: "flex-end",
    },

    timeChip: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.greyIconLight}`,
    },

    timeChipIcon: (isFirst: boolean) => ({
        fontSize: "14px",
        color: isFirst ? DefaultColours.greenTextDark : DefaultColours.greyPrimaryMainText,
    }),

    timeChipLabel: {
        ...TextStyles.regular,
        fontSize: "11px",
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: "143%",
    },

    timeChipValue: {
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        lineHeight: "143%",
    },

    chevronIcon: {
        fontSize: "20px",
        color: DefaultColours.greyPrimaryMainText,
        flexShrink: 0,
    },

    // Expanded event list

    expandedPanel: {
        borderTop: `1px solid ${DefaultColours.greyBackground}`,
        padding: "12px 20px 16px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
    },

    expandedPanelHeading: {
        ...TextStyles.medium,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
        marginBottom: "8px",
        letterSpacing: "0.5px",
        textTransform: "uppercase" as const,
    },

    eventRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 14px",
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: `${BorderRadius.mediumNotification}px`,
    },

    eventNumberPill: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: DefaultColours.greyIconLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    eventNumberText: {
        ...TextStyles.medium,
        fontSize: "11px",
        color: DefaultColours.white,
        lineHeight: 1,
    },

    eventTimeIcon: {
        fontSize: "16px",
        color: DefaultColours.greyPrimaryMainText,
        flexShrink: 0,
    },

    eventTimeText: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
        lineHeight: "143%",
    },

    firstOnSitePill: {
        marginLeft: "auto",
        padding: "2px 10px",
        backgroundColor: "#E8F5E9",
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.greenPrimary}`,
    },

    firstOnSitePillText: {
        ...TextStyles.medium,
        fontSize: "11px",
        color: DefaultColours.greenTextDark,
        lineHeight: "143%",
    },

    lastOnSitePill: (isAlsoFirst: boolean) => ({
        marginLeft: isAlsoFirst ? "8px" : "auto",
        padding: "2px 10px",
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: `${BorderRadius.mediumNotification}px`,
        border: `1px solid ${DefaultColours.greyIconLight}`,
    }),

    lastOnSitePillText: {
        ...TextStyles.medium,
        fontSize: "11px",
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: "143%",
    },
};