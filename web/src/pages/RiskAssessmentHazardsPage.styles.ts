import { BorderRadius, FontSize, TextStyles } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

export const riskAssessmentHazardsStyles = {
    pageContainer: {
        paddingTop: "24px",
        paddingBottom: "80px",
        paddingLeft: "104px",
        paddingRight: "104px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "24px",
        minHeight: "100vh",
        backgroundColor: DefaultColours.greyBackground,
    },

    sectionCard: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.mediumNotification,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        paddingY: "32px",
        paddingX: "24px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "0px",
    },

    headerRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
        paddingLeft: "4px",
    },

    backButton: {
        padding: "4px",
        color: DefaultColours.black,
    },

    backIcon: {
        fontSize: "20px",
    },

    sectionTitle: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
    },

    scrollList: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "24px",
        overflowY: "auto" as const,
        maxHeight: "600px",
        paddingBottom: "28px",
        paddingX: "12px",
        paddingTop: "12px",
    },

    hazardRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "24px",
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.smallTextField,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        padding: "12px 16px",
        cursor: "pointer",
        transition: "box-shadow 0.15s ease",
        "&:hover": {
            boxShadow: `0px 0px 8px ${DefaultColours.greyIconLight}`,
        },
    },

    iconWrapper: {
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    iconWrapperAmber: {
        backgroundColor: DefaultColours.amberBackgroundLight,
    },

    iconWrapperGreen: {
        backgroundColor: DefaultColours.greenBackgroundLight,
    },

    icon: {
        fontSize: "32px",
    },

    iconAmber: {
        color: DefaultColours.amberPrimary,
    },

    iconGreen: {
        color: DefaultColours.greenPrimary,
    },

    textBlock: {
        display: "flex",
        flexDirection: "column" as const,
        flex: 1,
        minWidth: 0,
    },

    hazardTitle: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: DefaultColours.black,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    assessorName: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyPrimaryMainText,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    dateText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyIconLight,
        marginTop: "2px",
    },

    // Status badge
    statusBadge: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "14px",
        paddingRight: "14px",
        paddingTop: "6px",
        paddingBottom: "6px",
        borderRadius: "8px",
        flexShrink: 0,
    },

    statusBadgeAmber: {
        backgroundColor: DefaultColours.amberBackgroundLight,
    },

    statusBadgeGreen: {
        backgroundColor: DefaultColours.greenBackgroundLight,
    },

    statusBadgeText: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        letterSpacing: "0.2px",
    },

    statusBadgeTextAmber: {
        color: DefaultColours.amberTextDark,
    },

    statusBadgeTextGreen: {
        color: DefaultColours.greenPrimary,
    },

    emptyState: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 0",
        gap: "8px",
    },

    emptyStateIcon: {
        fontSize: "48px",
        color: DefaultColours.greyIconLight,
    },

    emptyStateText: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyIconLight,
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.redPrimary,
        padding: "16px 0",
        textAlign: "center" as const,
    },
} as const;