import { BorderRadius, FontSize, TextStyles } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

const cardBorder = `1px solid ${DefaultColours.greyIconLight}55`;
const selectedCardBorder = `1px solid ${DefaultColours.redPrimary}88`;
const subtleFieldBorder = `${DefaultColours.greyIconLight}99`;

const panelMinHeight = 620;
const sidePanelHeight = "calc(100vh - 170px)";

const iconBoxSizeSmall = FontSize.xl32 + BorderRadius.smallTextField;
const iconBoxSizeMedium = FontSize.xxl36 + BorderRadius.mediumNotification;
const inputMinHeight = FontSize.l24 + FontSize.m20;
const selectMinHeight = FontSize.l24 + FontSize.l24;
const addButtonSize = FontSize.xxl36 + BorderRadius.smallTextField;

export const employeeOverviewStyles = {
    pageContainer: {
        paddingTop: 3,
        paddingLeft: 3,
        paddingRight: 3,
        paddingBottom: 2,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        backgroundColor: DefaultColours.greyBackground,
    },

    content: {
        width: "100%",
        maxWidth: 1500,
    },

    layout: {
        display: "grid",
        gridTemplateColumns: "440px minmax(0, 1fr)",
        gap: 3,
        alignItems: "start",
        minHeight: 0,
    },

    sideCard: {
        paddingTop: 3,
        paddingLeft: 2.5,
        paddingRight: 2.5,
        paddingBottom: 2.5,
        border: cardBorder,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        backgroundColor: DefaultColours.white,
        height: sidePanelHeight,
        minHeight: panelMinHeight,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },

    detailsCard: {
        paddingTop: 2.5,
        paddingLeft: 2.5,
        paddingRight: 2.5,
        paddingBottom: 2.5,
        border: cardBorder,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        backgroundColor: DefaultColours.white,
        minHeight: panelMinHeight,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "hidden",
    },

    emptyStateCard: {
        minHeight: panelMinHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        border: `2px dashed ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        backgroundColor: DefaultColours.white,
        padding: 3,
    },

    emptyStateContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 420,
    },

    emptyStateIcon: {
        fontSize: FontSize.xxl36 + FontSize.xl32,
        color: DefaultColours.greyIconLight,
        marginBottom: 2,
    },

    emptyStateTitle: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
        marginBottom: 0.75,
    },

    emptyStateSubtitle: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.4,
    },

    sideHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2.5,
    },

    sideTitle: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.semiBold.fontFamily,
        fontWeight: TextStyles.semiBold.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    addEmployeeButton: {
        width: addButtonSize,
        height: addButtonSize,
        borderRadius: BorderRadius.mediumNotification / 2,
        backgroundColor: DefaultColours.redPrimary,
        "&:hover": {
            backgroundColor: DefaultColours.redPrimary,
        },
    },

    addEmployeeButtonIcon: {
        fontSize: FontSize.l24,
        color: DefaultColours.white,
    },

    searchField: {
        marginBottom: 2,
        "& .MuiOutlinedInput-root": {
            borderRadius: BorderRadius.mediumNotification / 2,
            backgroundColor: DefaultColours.white,
            minHeight: inputMinHeight,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: subtleFieldBorder,
        },
    },

    searchIcon: {
        color: DefaultColours.greyPrimaryMainText,
        fontSize: FontSize.m20,
    },

    employeeListContainer: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: 0.5,
    },

    employeeList: {
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
    },

    employeeListItem: {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        paddingTop: 1.5,
        paddingBottom: 1.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        border: cardBorder,
        borderRadius: BorderRadius.mediumNotification / 2,
        cursor: "pointer",
        backgroundColor: DefaultColours.white,
        transition: "border-color 120ms ease, background-color 120ms ease",
    },

    employeeListItemSelected: {
        border: selectedCardBorder,
        backgroundColor: DefaultColours.white,
    },

    employeeListItemIconWrapper: {
        width: iconBoxSizeSmall,
        height: iconBoxSizeSmall,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.smallTextBackground / 2,
        backgroundColor: `${DefaultColours.greyIconLight}22`,
        flexShrink: 0,
    },

    employeeListItemIconWrapperSelected: {
        backgroundColor: DefaultColours.redTrafficBackgroundLight,
    },

    employeeListItemIcon: {
        fontSize: FontSize.l24,
        color: DefaultColours.greyIconLight,
    },

    employeeListItemIconSelected: {
        color: DefaultColours.redTrafficPrimary,
    },

    employeeListItemText: {
        minWidth: 0,
    },

    employeeListItemName: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    employeeListItemPosition: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.2,
        marginTop: 0.5,
    },

    employeeHeaderCard: {
        backgroundColor: DefaultColours.redPrimary,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
        paddingTop: 1.5,
        paddingBottom: 1.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    employeeHeaderLeft: {
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        minWidth: 0,
    },

    employeeHeaderIconWrapper: {
        width: iconBoxSizeMedium,
        height: iconBoxSizeMedium,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.mediumNotification / 2,
        backgroundColor: DefaultColours.redTrafficBackgroundLight,
        flexShrink: 0,
    },

    employeeHeaderIcon: {
        fontSize: FontSize.l24,
        color: DefaultColours.redTrafficPrimary,
    },

    employeeHeaderText: {
        minWidth: 0,
    },

    employeeHeaderName: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.white,
        lineHeight: 1.2,
        marginBottom: 0.5,
    },

    employeeHeaderPosition: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.white,
        lineHeight: 1.2,
        marginBottom: 0.25,
    },

    employeeHeaderEmail: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.white,
        lineHeight: 1.2,
        wordBreak: "break-word",
    },

    employeeHeaderEditButton: {
        padding: 0.5,
        color: DefaultColours.white,
    },

    employeeHeaderEditIcon: {
        fontSize: FontSize.l24,
        color: DefaultColours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
    },

    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 2,
    },

    statCard: {
        paddingTop: 1.5,
        paddingBottom: 1.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        border: cardBorder,
        borderRadius: BorderRadius.mediumNotification / 2,
        backgroundColor: DefaultColours.white,
    },

    statCardTopRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        marginBottom: 1,
    },

    statCardTopRowText: {
        display: "flex",
        flexDirection: "column",
        gap: 0.25,
        minWidth: 0,
    },

    hoursWorkedIconWrapper: {
        width: iconBoxSizeSmall,
        height: iconBoxSizeSmall,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
        backgroundColor: DefaultColours.greenBackgroundLight,
        flexShrink: 0,
    },

    hoursWorkedIcon: {
        fontSize: FontSize.m20,
        color: DefaultColours.greenPrimary,
    },

    latesIconWrapper: {
        width: iconBoxSizeSmall,
        height: iconBoxSizeSmall,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
        backgroundColor: DefaultColours.amberBackgroundLight,
        flexShrink: 0,
    },

    latesIcon: {
        fontSize: FontSize.m20,
        color: DefaultColours.amberPrimary,
    },

    statCardPeriodText: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.2,
    },

    statCardValue: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    statCardLabel: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    sectionCard: {
        paddingTop: 1.5,
        paddingBottom: 1.5,
        paddingLeft: 1.5,
        paddingRight: 1.5,
        border: cardBorder,
        borderRadius: BorderRadius.mediumNotification / 2,
        backgroundColor: DefaultColours.white,
    },

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        marginBottom: 1.5,
    },

    sectionTitle: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    sectionContent: {
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
    },

    timeOffIconWrapper: {
        width: iconBoxSizeSmall,
        height: iconBoxSizeSmall,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
        backgroundColor: DefaultColours.greenBackgroundLight,
    },

    timeOffIcon: {
        fontSize: FontSize.m20,
        color: DefaultColours.greenPrimary,
    },

    learningIconWrapper: {
        width: iconBoxSizeSmall,
        height: iconBoxSizeSmall,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
        backgroundColor: DefaultColours.amberBackgroundLight,
    },

    learningIcon: {
        fontSize: FontSize.m20,
        color: DefaultColours.amberPrimary,
    },

    payslipIconWrapper: {
        width: iconBoxSizeSmall,
        height: iconBoxSizeSmall,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.largeButtonsAndOutlines / 4,
        backgroundColor: DefaultColours.redTrafficBackgroundLight,
    },

    payslipIcon: {
        fontSize: FontSize.m20,
        color: DefaultColours.redTrafficPrimary,
    },

    leaveTypeChip: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        minHeight: FontSize.m20 + BorderRadius.largeButtonsAndOutlines / 4,
        paddingLeft: 1.1,
        paddingRight: 1.1,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 8,
        backgroundColor: DefaultColours.blueLight,
        color: DefaultColours.blueDark,
        fontSize: FontSize.xs14,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        lineHeight: 1,
        marginBottom: 0.5,
    },

    sectionMainText: {
        fontSize: FontSize.l24,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.3,
    },

    sectionSecondaryLabel: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
    },

    sectionEmptyText: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.3,
    },

    payslipRow: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 1,
        alignItems: "center",
        marginTop: 0.25,
    },

    payslipSelect: {
        "& .MuiOutlinedInput-root": {
            borderRadius: BorderRadius.mediumNotification / 2,
            backgroundColor: DefaultColours.white,
            minHeight: selectMinHeight,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: subtleFieldBorder,
        },
        "& .MuiSelect-select": {
            fontSize: FontSize.s16,
            fontFamily: TextStyles.regular.fontFamily,
            fontWeight: TextStyles.regular.fontWeight,
            color: DefaultColours.black,
        },
    },

    uploadButton: {
        minHeight: selectMinHeight + 8,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 5,
        backgroundColor: DefaultColours.redPrimary,
        color: DefaultColours.white,
        textTransform: "none",
        fontSize: FontSize.s16,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        paddingLeft: 2,
        paddingRight: 2,
        boxShadow: "none",
        "&:hover": {
            backgroundColor: DefaultColours.redPrimary,
            boxShadow: "none",
        },
    },

    errorText: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.redPrimary,
        lineHeight: 1.3,
        marginBottom: 1,
    },

    emptyListText: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.3,
    },

    addEmployeeFormCard: {
        paddingTop: 2.5,
        paddingLeft: 2.5,
        paddingRight: 2.5,
        paddingBottom: 2.5,
        border: cardBorder,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        backgroundColor: DefaultColours.white,
        minHeight: panelMinHeight,
        height: sidePanelHeight,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        gap: 2,
    },

    addEmployeeFormScroll: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: 0.5,
    },

    addEmployeeSection: {
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        marginBottom: 3,
    },

    addEmployeeSectionTitle: {
        fontSize: FontSize.xl32,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        lineHeight: 1.2,
        marginBottom: 0.5,
    },

    addEmployeeFieldGridTwo: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 1.5,
    },

    addEmployeeFieldGridOne: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: 1.5,
    },

    addEmployeeTextField: {
        "& .MuiOutlinedInput-root": {
            borderRadius: BorderRadius.mediumNotification / 2,
            backgroundColor: DefaultColours.white,
            minHeight: inputMinHeight + 6,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: subtleFieldBorder,
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: DefaultColours.greyPrimaryMainText,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: DefaultColours.redPrimary,
        },
        "& .MuiInputBase-input": {
            fontSize: FontSize.s16,
            fontFamily: TextStyles.regular.fontFamily,
            fontWeight: TextStyles.regular.fontWeight,
            color: DefaultColours.black,
        },
        "& .MuiInputBase-input::placeholder": {
            color: DefaultColours.greyPrimaryMainText,
            opacity: 1,
        },
    },

    addEmployeeSelect: {
        "& .MuiOutlinedInput-root": {
            borderRadius: BorderRadius.mediumNotification / 2,
            backgroundColor: DefaultColours.white,
            minHeight: selectMinHeight + 6,
        },
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: subtleFieldBorder,
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: DefaultColours.greyPrimaryMainText,
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: DefaultColours.redPrimary,
        },
        "& .MuiSelect-select": {
            fontSize: FontSize.s16,
            fontFamily: TextStyles.regular.fontFamily,
            fontWeight: TextStyles.regular.fontWeight,
            color: DefaultColours.black,
        },
    },

    addEmployeeButtonRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
        marginTop: "auto",
        paddingTop: 1,
    },

    addEmployeeCancelButton: {
        minHeight: 56,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        textTransform: "none" as const,
        fontSize: FontSize.m20,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        color: DefaultColours.black,
        borderColor: DefaultColours.greyIconLight,
        paddingLeft: 3,
        paddingRight: 3,
        flex: 1,
    },

    addEmployeeSubmitButton: {
        minHeight: 56,
        borderRadius: BorderRadius.largeButtonsAndOutlines / 2,
        backgroundColor: DefaultColours.redPrimary,
        color: DefaultColours.white,
        textTransform: "none" as const,
        fontSize: FontSize.m20,
        fontFamily: TextStyles.medium.fontFamily,
        fontWeight: TextStyles.medium.fontWeight,
        paddingLeft: 3,
        paddingRight: 3,
        flex: 2,
        boxShadow: "none",
        "&:hover": {
            backgroundColor: DefaultColours.redTextDark,
            boxShadow: "none",
        },
        "&.Mui-disabled": {
            backgroundColor: DefaultColours.greyIconLight,
            color: DefaultColours.white,
        },
    },

    addEmployeeHelperText: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greyPrimaryMainText,
        lineHeight: 1.3,
        marginTop: -0.5,
    },

    addEmployeeSuccessText: {
        fontSize: FontSize.s16,
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        color: DefaultColours.greenPrimary,
        lineHeight: 1.3,
        marginBottom: 0.5,
    },
} as const;
