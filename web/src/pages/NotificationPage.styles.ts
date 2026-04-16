import {DefaultColours} from "../theme/colours.ts";
import {BorderRadius, FontSize, TextStyles} from "../theme/theme.ts";

const typeLabelColors = {
    leave:   { color: DefaultColours.amberPrimary, background: DefaultColours.amberBackgroundLight },
    signed:  { color: DefaultColours.greenPrimary, background: DefaultColours.greenBackgroundLight },
    late:    { color: DefaultColours.redPrimary, background: DefaultColours.redBackgroundLight },
    hazard:  { color: DefaultColours.redPrimary, background: DefaultColours.redBackgroundLight },
    default: { color: DefaultColours.greyPrimaryMainText, background: DefaultColours.greyBackground },
};

export const notificationPageStyles = {
    page: {
        minHeight: "100vh",
        backgroundColor: DefaultColours.greyBackground,
    },

    pageContainer: {
        maxWidth: "960px",
        margin: "0 auto",
        padding: "32px 24px",
    },

    header: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "24px",
    },

    title: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.bold,
        color: DefaultColours.black,
        marginBottom: "4px",
    },

    subtitle: {
        fontSize: FontSize.xs14,
        color: DefaultColours.greyIconLight,
    },

    markAllButton: {
        backgroundColor: DefaultColours.redBackgroundLight,
        color: DefaultColours.redTextDark,
        textTransform: "none",
        borderRadius: BorderRadius.smallTextBackground,
        padding: "8px 16px",
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.semiBold,
        flexShrink: 0,
        "&:hover": {
            backgroundColor: DefaultColours.redTextDark,
            color: DefaultColours.white,
        },
    },

    sectionHeader: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.bold,
        color: DefaultColours.black,
        marginBottom: "12px",
    },

    notificationList: {
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        overflow: "hidden",
    },

    notificationCard: {
        backgroundColor: DefaultColours.white,
        border: `1px solid ${DefaultColours.greyIconLight}55`,
        borderRadius: BorderRadius.smallTextField,
        margin: "8px",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },

    typeLabel: (colorKey: keyof typeof typeLabelColors) => ({
        display: "inline-block",
        alignSelf: "flex-start",
        fontSize: FontSize.xxs12,
        fontFamily: TextStyles.bold,
        color: typeLabelColors[colorKey].color,
        backgroundColor: typeLabelColors[colorKey].background,
        borderRadius: "4px",
        padding: "2px 8px",
    }),

    message: {
        fontSize: FontSize.xs14,
        color: DefaultColours.black,
    },

    timestamp: {
        fontSize: FontSize.xxs12,
        color: DefaultColours.greenPrimary,
    },
};