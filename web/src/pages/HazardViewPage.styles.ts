import { BorderRadius, FontSize, TextStyles } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

const cardBorder = `1px solid ${DefaultColours.greyIconLight}55`;

export const hazardViewStyles = {
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

    sectionCard: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.mediumNotification,
        border: cardBorder,
        boxShadow: `0px 0px 4px ${DefaultColours.greyIconLight}33`,
        paddingY: "32px",
        paddingX: "24px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "20px",
    },

    headerRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "8px",
    },

    backButton: {
        padding: "4px",
        color: DefaultColours.black,
    },

    backIcon: {
        fontSize: "20px",
    },

    sectionTitle: {
        ...TextStyles.semiBold,
        fontSize: FontSize.xl32,
        color: DefaultColours.black,
    },

    divider: {
        borderColor: `${DefaultColours.greyIconLight}55`,
        marginTop: "-4px",
    },

    // Individual field
    fieldWrapper: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
    },

    fieldLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.s16,
        color: DefaultColours.greyIconLight,
    },

    fieldBox: {
        border: `1px solid ${DefaultColours.greyIconLight}66`,
        borderRadius: BorderRadius.smallTextField,
        padding: "12px 16px",
        backgroundColor: DefaultColours.greyBackground,
    },

    fieldValue: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
    },

    // Submitted by + date side by side
    metaRow: {
        display: "flex",
        flexDirection: "row" as const,
        gap: "16px",
    },

    metaItem: {
        flex: 1,
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
    },

    // Photos
    photoGrid: {
        display: "flex",
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        gap: "12px",
    },

    photo: {
        width: "120px",
        height: "120px",
        borderRadius: "8px",
        objectFit: "cover" as const,
        border: `1px solid ${DefaultColours.greyIconLight}44`,
    },

    // Action completed
    checkboxRow: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        gap: "10px",
        paddingTop: "4px",
    },

    checkboxIcon: {
        fontSize: "28px",
        color: DefaultColours.greenPrimary,
    },

    checkboxIconUnchecked: {
        fontSize: "28px",
        color: DefaultColours.greyIconLight,
    },

    checkboxLabel: {
        ...TextStyles.regular,
        fontSize: FontSize.m20,
        color: DefaultColours.greyPrimaryMainText,
    },

    errorText: {
        ...TextStyles.regular,
        fontSize: FontSize.xs14,
        color: DefaultColours.redPrimary,
        padding: "16px 0",
        textAlign: "center" as const,
    },
} as const;