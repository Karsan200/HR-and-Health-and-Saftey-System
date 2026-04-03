import { BorderRadius, FontSize, TextStyles } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

export const dashboardStyles = {
    pageContainer: {
        paddingTop: 3,
        paddingLeft: 3,
        paddingRight: 3,
        paddingBottom: 2,
        display: "flex",
        justifyContent: "center",
        width: "100%",
    },

    topCardsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 10,
        alignItems: "stretch",
        width: "100%",
        maxWidth: 1500,
    },

    card: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        border: `1px solid ${DefaultColours.greyIconLight}55`,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.08)",
        paddingTop: 3,
        paddingLeft: 3,
        paddingRight: 3,
        paddingBottom: 2.5,
        minHeight: 245,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
    },

    cardTopRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 2,
    },

    iconWrapper: {
        width: 90,
        height: 90,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },

    icon: {
        fontSize: 65,
    },

    documentIconWrapper: {
        backgroundColor: DefaultColours.amberBackgroundLight,
    },

    documentIcon: {
        color: DefaultColours.amberPrimary,
    },

    lateIconWrapper: {
        backgroundColor: DefaultColours.redTrafficBackgroundLight,
    },

    lateIcon: {
        color: DefaultColours.redTrafficPrimary,
    },

    hazardIconWrapper: {
        backgroundColor: DefaultColours.redTrafficBackgroundLight,
    },

    hazardIcon: {
        color: DefaultColours.redTrafficPrimary,
    },

    trendRow: {
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        marginTop: 0.5,
    },

    trendDownIcon: {
        fontSize: FontSize.xl32,
        color: DefaultColours.greenPrimary,
    },

    trendDownText: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.greenPrimary,
        lineHeight: 1,
    },

    trendUpIcon: {
        fontSize: FontSize.xl32,
        color: DefaultColours.redTrafficPrimary,
    },

    trendUpText: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.redTrafficPrimary,
        lineHeight: 1,
    },

    valueText: {
        fontSize: FontSize.xxl36,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.1,
        marginBottom: 1.2,
    },

    labelText: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },
} as const;
