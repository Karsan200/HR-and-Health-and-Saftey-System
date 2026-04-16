import { BorderRadius, FontSize, TextStyles } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

const cardBorder = `1px solid ${DefaultColours.greyIconLight}55`;

export const reviewSubmissionsStyles = {
    // Page Shell
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

    // Section card (wraps the whole Document Signatures block)
    sectionCard: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.mediumNotification,
        border: cardBorder,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}33`,
        paddingY: "32px",
        paddingX: "24px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "0px",
    },

    // Section heading
    sectionTitle: {
        ...TextStyles.semiBold,
        fontSize: FontSize.xl32,
        color: DefaultColours.black,
        marginBottom: "16px",
        paddingLeft: "12px",
    },

    // Scrollable list container
    scrollList: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "24px",
        overflowY: "auto" as const,
        maxHeight: "420px",
        paddingBottom: "28px",
        paddingX: "12px",
        paddingTop:"12px",

    },

    // Individual signature row card
    signatureRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "24px",
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.smallTextField,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        padding: "12px 16px",
    },

    // Document icon wrapper
    iconWrapper: {
        width: "60px",
        height: "60px",
        borderRadius: "8px",
        backgroundColor: DefaultColours.amberBackgroundLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    icon: {
        color: DefaultColours.amberPrimary,
        fontSize: "50px",
    },

    // Text block
    textBlock: {
        display: "flex",
        flexDirection: "column" as const,
        flex: 1,
        minWidth: 0,
    },

    personName: {
        ...TextStyles.medium,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    documentTitle: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    sentDate: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyIconLight,
        marginTop: "2px",
    },

    // Pending badge
    pendingBadge: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "14px",
        paddingRight: "14px",
        paddingTop: "6px",
        paddingBottom: "6px",
        borderRadius: "8px",
        backgroundColor: DefaultColours.amberBackgroundLight,
        flexShrink: 0,
    },

    pendingBadgeText: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: DefaultColours.amberTextDark,
        letterSpacing: "0.2px",
    },

    // Empty state
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

    // Loading / error
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 0",
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.redPrimary,
        padding: "16px 0",
        textAlign: "center" as const,
    },
} as const;