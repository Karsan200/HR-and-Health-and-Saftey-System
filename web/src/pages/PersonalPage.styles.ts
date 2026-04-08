import { DefaultColours } from "../theme/colours";
import {BorderRadius, FontSize, TextStyles} from "../theme/theme.ts";

export const personalPageStyles = {
    pageContainer: {
        maxWidth: "900px",
        margin: "0 auto",
        padding: "1.5rem",
    },

    headerCard: {
        background: DefaultColours.redPrimary,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
    },

    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: DefaultColours.greyPrimaryMainText,
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
        fontWeight: 500,
        color: DefaultColours.white,
        lineHeight: 1.3,
    },

    headerRole: {
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        color: DefaultColours.greyBackground,
    },

    headerEmail: {
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        color: DefaultColours.greyBackground,
    },

    adminBadge: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255,255,255,0.15)",
        border: "0.5px solid rgba(255,255,255,0.3)",
        borderRadius: "8px",
        padding: "8px 14px",
        color: DefaultColours.white,
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        fontWeight: 500,
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
        fontWeight: 500,
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
};