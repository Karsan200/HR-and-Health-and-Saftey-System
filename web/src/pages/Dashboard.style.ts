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

    dashboardContent: {
        width: "100%",
        maxWidth: 1500,
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

    lateChartCard: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        border: `1px solid ${DefaultColours.greyIconLight}40`,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.06)",
        paddingTop: 3.25,
        paddingLeft: 3.75,
        paddingRight: 3.75,
        paddingBottom: 3,
        marginTop: 0,
        minHeight: 355,
        maxWidth: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },

    lateChartHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        marginBottom: 1,
    },

    lateChartHeaderText: {
        minWidth: 0,
        flex: 1,
    },

    lateChartTitle: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
        marginBottom: 0.4,
    },

    lateChartSubtitle: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.2,
    },

    lateChartSelectControl: {
        minWidth: 100,
        flexShrink: 0,
    },

    lateChartSelect: {
        minHeight: "auto",
        backgroundColor: "transparent",
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        borderRadius: BorderRadius.smallTextBackground,
        "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
        "& .MuiSelect-select": {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: "22px !important",
            lineHeight: 1.2,
            minHeight: "unset !important",
            display: "flex",
            alignItems: "center",
        },
        "& .MuiSelect-icon": {
            right: 0,
            fontSize: 16,
            color: DefaultColours.black,
        },
    },

    lateChartSelectMenuPaper: {
        borderRadius: BorderRadius.mediumNotification,
        boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.12)",
        border: `1px solid ${DefaultColours.greyIconLight}33`,
    },

    lateChartTotalText: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.redTrafficPrimary,
        lineHeight: 1.1,
        marginBottom: 2.5,
    },

    lateChartBody: {
        display: "flex",
        gap: 1.75,
        flex: 1,
        minHeight: 350,
        alignItems: "stretch",
    },

    lateChartYAxis: {
        width: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        paddingTop: 2,
        paddingBottom: 3.5,
    },

    lateChartYAxisRow: {
        flex: 0.1,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
    },

    lateChartYAxisLabel: {
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1,
    },

    lateChartPlotArea: {
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 2,
        paddingBottom: 0.5,
        maxWidth:600,
    },

    lateChartBarsRow: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 3,
        height: "100%",
        borderLeft: `1px solid ${DefaultColours.greyIconLight}66`,
        borderBottom: `1px solid ${DefaultColours.greyIconLight}66`,
        paddingLeft: 2,
        paddingRight: 0.5,
        paddingTop: 1,
        paddingBottom: 0,
    },

    lateChartBarColumn: {
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
    },

    lateChartBarTrack: {
        width: "100%",
        maxWidth: 100,
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
    },

    lateChartBarFill: {
        width: "100%",
        backgroundColor: DefaultColours.redPrimary,
        borderTopLeftRadius: BorderRadius.smallTextField,
        borderTopRightRadius: BorderRadius.smallTextField,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        minHeight: 0,
        transition: "height 180ms ease",
    },

    lateChartXAxisLabel: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.2,
        textAlign: "center",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "100%",
    },
    lateChartXAxisLabelsRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 0.1,
        paddingLeft: 2,
        paddingRight: 0.5,
        marginTop: 1,
    },

    lateChartXAxisLabelColumn: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        justifyContent: "center",
    },

    documentSignatureSignedColour: DefaultColours.greenPrimary,
    documentSignaturePendingColour: DefaultColours.amberPrimary,
    documentSignatureEmptyRingColour: `${DefaultColours.greyIconLight}55`,

    documentSignatureCard: {
        backgroundColor: DefaultColours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        border: `1px solid ${DefaultColours.greyIconLight}40`,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.06)",
        paddingTop: 3.25,
        paddingLeft: 3.75,
        paddingRight: 3.75,
        paddingBottom: 3,
        marginTop: 0,
        minHeight: 355,
        maxWidth: 690,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },

    documentSignatureHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        marginBottom: 2,
    },

    documentSignatureHeaderText: {
        minWidth: 0,
        flex: 1,
    },

    documentSignatureTitle: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
        marginBottom: 0.4,
    },

    documentSignatureSubtitle: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.2,
    },

    documentSignatureSelectControl: {
        minWidth: 100,
        flexShrink: 0,
    },

    documentSignatureSelect: {
        minHeight: "auto",
        backgroundColor: "transparent",
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        borderRadius: BorderRadius.smallTextBackground,
        "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "none",
        },
        "& .MuiSelect-select": {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: "22px !important",
            lineHeight: 1.2,
            minHeight: "unset !important",
            display: "flex",
            alignItems: "center",
        },
        "& .MuiSelect-icon": {
            right: 0,
            fontSize: 16,
            color: DefaultColours.black,
        },
    },

    documentSignatureSelectMenuPaper: {
        borderRadius: BorderRadius.mediumNotification,
        boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.12)",
        border: `1px solid ${DefaultColours.greyIconLight}33`,
    },

    documentSignatureBody: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 5,
        paddingTop: 1,
    },

    documentSignatureDonutWrapper: {
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 320,
    },

    documentSignatureDonut: {
        width: 300,
        height: 300,
        borderRadius: "50%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(-90deg)",
    },

    documentSignatureDonutInner: {
        width: 220,
        height: 220,
        borderRadius: "50%",
        backgroundColor: DefaultColours.white,
        transform: "rotate(90deg)",
    },

    documentSignatureLegend: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        justifyContent: "center",
        maxWidth: 180,
    },

    documentSignatureLegendRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
    },

    documentSignatureLegendLeft: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: 0,
    },

    documentSignatureLegendDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        flexShrink: 0,
    },

    documentSignatureLegendLabel: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    documentSignatureLegendValue: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
        minWidth: 18,
        textAlign: "right",
    },

    chartRow: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 15,
        marginTop: 4,
        width: "100%",
        alignItems: "stretch",
    },
} as const;
