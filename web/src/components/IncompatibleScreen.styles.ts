import {FontSize, TextStyles} from "../theme/theme.ts";

export const IncompatibleScreenStyles = {
    container: {
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        boxSizing: "border-box",
    },
    alert: {
        width: "100%",
        maxWidth: 640,
        padding: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1,
        fontSize: FontSize.m20,
        fontWeight: TextStyles.medium.fontWeight,
        fontFamily: TextStyles.medium.fontFamily,
    },
    icon: {
        fontSize: FontSize.xxl36,
        fontWeight: TextStyles.extraBold.fontWeight,
        fontFamily: TextStyles.extraBold.fontFamily
    },
    alert_title: {
        fontSize: FontSize.xl32,
        fontWeight: TextStyles.bold.fontWeight,
        fontFamily: TextStyles.bold.fontFamily
    },
}