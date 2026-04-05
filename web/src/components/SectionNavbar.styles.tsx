import { DefaultColours } from "../theme/colours";
import { FontSize, TextStyles } from "../theme/theme";

export const sectionNavBarStyles = {
    // Row containing all navigation tab cards
    row: {
        display: "flex",
        flexDirection: "row" as const,
        gap: "24px",
        width: "100%",
    },

    // Base card style shared by all tabs
    card: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px 0",
        backgroundColor: DefaultColours.white,
        borderRadius: "24px",
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}`,
        border: `1px solid transparent`,
        cursor: "pointer",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        "&:hover": {
            boxShadow: `0px 0px 8px ${DefaultColours.greyIconLight}`,
        },
    },

    // Applied on top of the base card when the alert flag is set
    cardAlert: {
        border: `1px solid ${DefaultColours.redPrimary}`,
    },

    // Applied on top of the base card when the tab route matches the current path
    cardActive: {
        border: `1px solid ${DefaultColours.redPrimary}`,
        boxShadow: `0px 0px 6px ${DefaultColours.redBackgroundLight}`,
    },

    // Label text inside each tab card
    label: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.black,
        textAlign: "center" as const,
        letterSpacing: "0.17px",
    },
};