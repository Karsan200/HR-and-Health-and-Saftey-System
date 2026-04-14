import { BorderRadius, FontSize, TextStyles } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

const cardBorder = `1px solid ${DefaultColours.greyIconLight}55`;

export const sendOutDocumentsStyles = {
    pageContainer: {
        paddingTop: "24px",
        paddingBottom: "80px",
        paddingLeft: "104px",
        paddingRight: "104px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minHeight: "100vh",
        backgroundColor: DefaultColours.greyBackground,
    },

    formCard: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        border: cardBorder,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}33`,
        padding: "32px",
        flexDirection: "column",
        display: "flex",
        width: "100%",
        gap: "16px",
    },

    cardTitle: {
        ...TextStyles.semiBold,
        fontSize: FontSize.l24,
        color: DefaultColours.black,
        marginBottom: "24px",
    },

    checkboxRow: {
        marginBottom: "24px",
    },

    uploadSectionLabel: {
        ...TextStyles.semiBold,
        fontSize: FontSize.m20,
        color: DefaultColours.black,
        marginBottom: "12px",
    },

    dropZoneIcon: {
        fontSize: "100px",
        color: DefaultColours.greyIconLight,
        marginBottom: "4px",
    },

    dropZoneText: {
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
        color: DefaultColours.black,
    },

    dropZoneSubText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greyPrimaryMainText,
    },

    dropZoneFileName: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: DefaultColours.redTextDark,
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.redPrimary,
        marginBottom: "8px",
    },

    successText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.greenPrimary,
        marginBottom: "8px",
    },

    submitButton: {
        width: "100%",
        paddingTop: "18px",
        paddingBottom: "18px",
        borderRadius: "12px",
        textTransform: "none" as const,
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
    },

} as const;

/**
 * Drop zone style
 */
export function getDropZoneStyle(isDragOver: boolean): React.CSSProperties {



    return {
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        border: `2px dashed ${DefaultColours.greyIconLight}`,
        padding: "24px",
        minHeight: "270px",
        marginBottom: "24px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: isDragOver
            ? DefaultColours.redBackgroundLight
            : "transparent",
        transition: "background-color 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        justifyContent: "center",
    };
}