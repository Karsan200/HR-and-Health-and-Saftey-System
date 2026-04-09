import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles } from "../theme/theme";

export const navbarStyles = {
    appBar: {
        backgroundColor: DefaultColours.white,
        boxShadow: "boxShadow: \"0px 4px 12px rgba(0, 0, 0, 0.08)\"",
        borderBottom: "none",
    },
    toolbar: {
        minHeight: 72,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingLeft: 3,
        paddingRight: 3,
    },
    logoContainer: {
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
    },
    logo: {
        height: 40,
        width: "auto",
        display: "block",
    },
    navWrapper: {
        display: "flex",
        justifyContent: "center",
        flex: 1,
    },
    navContainer: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: 999,
        padding: 0.5,
    },
    navButton: {
        color: DefaultColours.black,
        textTransform: "none",
        borderRadius: 999,
        paddingLeft: 2.5,
        paddingRight: 2.5,
        paddingTop: 1,
        paddingBottom: 1,
        minWidth: "fit-content",
        fontSize: FontSize.s16,
        fontWeight: TextStyles.medium.fontWeight,
        fontFamily: TextStyles.medium.fontFamily,
        textDecoration: "none",
        "&.active": {
            backgroundColor: DefaultColours.white,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        },
    },
    activeNavButton: {
        backgroundColor: DefaultColours.white,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
    },
    actionsContainer: {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexShrink: 0,
    },
    iconButton: {
        color: DefaultColours.greyPrimaryMainText,
    },
    notificationDot: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: DefaultColours.redPrimary,
    },
    notificationWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
} as const;
