import {DefaultColours} from "../theme/colours.ts";
import {BorderRadius, FontSize, TextStyles} from "../theme/theme.ts";

const typeLabelColors = {
    leave:   { color: DefaultColours.amberBackgroundLight, background: DefaultColours.amberPrimary },
    signed:  { color: DefaultColours.greenBackgroundLight, background: DefaultColours.greenPrimary },
    late:    { color: DefaultColours.redBackgroundLight, background: DefaultColours.redPrimary },
    hazard:  { color: DefaultColours.redBackgroundLight, background: DefaultColours.redPrimary },
    default: { color: DefaultColours.greyBackground, background: DefaultColours.greyPrimaryMainText },
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
        backgroundColor: DefaultColours.redPrimary,
        color: DefaultColours.white,
        textTransform: "none",
        borderRadius: BorderRadius.smallTextBackground,
        padding: "8px 16px",
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular,
        flexShrink: 0,
        "&:hover": {
            backgroundColor: DefaultColours.redTextDark,
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
        border: "1px solid DefaultColours.black",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: DefaultColours.white, // acts as divider colour between cards
    },

    notificationCard: {
        backgroundColor: DefaultColours.white,
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