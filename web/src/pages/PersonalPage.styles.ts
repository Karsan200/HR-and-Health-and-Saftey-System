import { DefaultColours } from "../theme/colours";
import {BorderRadius, FontSize, TextStyles} from "../theme/theme";

export const personalPageStyles = {
    pageContainer: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1.5rem",
    },

    headerCard: {
        background: DefaultColours.redPrimary,
        borderRadius: BorderRadius.smallTextBackground,
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
    },

    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: DefaultColours.redTextDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    headerInfo: {
        flex: 1,
    },

    headerName: {
        fontSize: FontSize.m20,
        fontFamily: TextStyles.semiBold,
        color: DefaultColours.white,
        lineHeight: 1.3,
    },

    headerEmail: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular,
        color: DefaultColours.greyBackground,
    },

    adminBadge: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        color: DefaultColours.white,
        whiteSpace: "nowrap",
        flexShrink: 0,
    },

    tabsRow: {
        display: "flex",
        borderBottom: `1px solid ${DefaultColours.greyBackground}`,
        marginBottom: "1.5rem",
    },

    tab: (active: boolean) => ({
        padding: "10px 24px",
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        color: active ? DefaultColours.redPrimary : DefaultColours.greyPrimaryMainText,
        cursor: "pointer",
        borderBottom: active ? `2px solid ${DefaultColours.redPrimary}` : "2px solid transparent",
        marginBottom: "-1px",
        fontWeight: active ? 500 : 400,
        "&:hover": {
            color: DefaultColours.black,
        },
        transition: "color 0.15s",
    }),

    sectionCard: {
        background: DefaultColours.white,
        border: `0.5px solid ${DefaultColours.greyBackground}`,
        borderRadius: "12px",
        padding: "1.25rem",
        marginBottom: "1rem",
    },

    sectionTitle: {
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        color: DefaultColours.black,
        marginBottom: "1rem",
    },

    infoRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 0",
        borderBottom: `0.5px solid ${DefaultColours.greyBackground}`,
        "&:last-child": {
            borderBottom: "none",
            paddingBottom: 0,
        },
        "&:first-of-type": {
            paddingTop: 0,
        },
    },

    iconWrap: (bg: string) => ({
        width: 32,
        height: 32,
        borderRadius: "8px",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    }),

    infoLabel: {
        fontSize: FontSize.xxs12,
        fontFamily: TextStyles.regular,
        color: DefaultColours.greyPrimaryMainText,
        marginBottom: "1px",
    },

    infoValue: {
        fontSize: FontSize.xxs12,
        fontFamily: TextStyles.regular,
        color: DefaultColours.black,
    },

    notifText: {
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        color: DefaultColours.greyPrimaryMainText,
    },

    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        padding: "3rem",
    },

    errorText: {
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        color: DefaultColours.redPrimary,
        textAlign: "center",
        padding: "2rem",
    },

    placeHolderCard: {
        textAlign: "center",
        padding: "3rem",
    },

    // Icon colours and backgrounds for info rows
    iconColours: {
        red: {
            icon: DefaultColours.redBackgroundLight,
            bg: DefaultColours.redTextDark,
        },
        green: {
            icon: DefaultColours.greenBackgroundLight,
            bg: DefaultColours.greenTextDark,
        },
        amber: {
            icon: DefaultColours.amberBackgroundLight,
            bg: DefaultColours.amberTextDark,
        },
    },

    redIcon: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular,
        color: DefaultColours.redPrimary,
    },

    greenIcon: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular,
        color: DefaultColours.greenPrimary,
    },

    amberIcon: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular,
        color: DefaultColours.amberPrimary,
    },

    loadingSpinner: {
        color: DefaultColours.redPrimary,
    },

    adminBadgeIcon: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.bold,
        color: DefaultColours.white,
    },

    avatarIcon: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.bold,
        color: DefaultColours.white,
    },

    // Security tab
    securityCard: {
        background: DefaultColours.white,
        border: `0.5px solid ${DefaultColours.greyBackground}`,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        padding: "1.25rem",
        marginBottom: "1rem",
    },

    securityTitle: {
        fontSize: FontSize.m20,
        fontWeight: 500,
        color: DefaultColours.black,
        marginBottom: "1.25rem",
    },

    securityInput: {
        width: "100%",
        padding: "14px 16px",
        fontSize: FontSize.xs14,
        border: `0.5px solid ${DefaultColours.greyBackground}`,
        borderRadius: BorderRadius.mediumNotification,
        marginBottom: "12px",
        outline: "none",
        fontFamily: "inherit",
        color: DefaultColours.black,
        backgroundColor: DefaultColours.white,
        boxSizing: "border-box" as const,
        "&:focus": {
            borderColor: DefaultColours.redPrimary,
        },
    },

    securityButtonRow: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "4px",
    },

    securityButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: DefaultColours.redPrimary,
        color: DefaultColours.white,
        border: "none",
        borderRadius: "8px",
        padding: "12px 20px",
        fontSize: FontSize.xs14,
        cursor: "pointer",
        fontFamily: "inherit",
        "&:hover": {
            background: DefaultColours.redBackgroundLight,
        },
    },

    securitySuccessText: {
        fontSize: FontSize.m20,
        color: DefaultColours.greenPrimary,
        textAlign: "right" as const,
        marginTop: "8px",
    },

    securityErrorText: {
        fontSize: FontSize.xs14,
        color: DefaultColours.redPrimary,
        textAlign: "right" as const,
        marginTop: "8px",
    },
};