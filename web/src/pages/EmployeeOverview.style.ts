import { BorderRadius } from "../theme/theme";
import { DefaultColours } from "../theme/colours";

export const employeeOverviewStyles = {
    pageContainer: {
        padding: 3,
        width: "100%",
    },

    content: {
        width: "100%",
    },

    layout: {
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 3,
        alignItems: "start",
    },

    sideCard: {
        padding: 2,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.mediumNotification,
        backgroundColor: DefaultColours.white,
        height: "calc(100vh - 180px)",
        minHeight: 600,
        display: "flex",
        flexDirection: "column",
    },

    detailsCard: {
        padding: 2,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.mediumNotification,
        backgroundColor: DefaultColours.white,
        minHeight: 600,
    },

    sideHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
    },

    searchField: {
        marginBottom: 2,
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
        gap: 1,
    },

    employeeListItem: {
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        padding: 1.5,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.smallTextField,
        cursor: "pointer",
        backgroundColor: DefaultColours.white,
    },

    employeeListItemSelected: {
        border: `1px solid ${DefaultColours.redPrimary}`,
        backgroundColor: DefaultColours.redTrafficBackgroundLight,
    },

    employeeListItemIconWrapper: {
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BorderRadius.smallTextField,
        backgroundColor: DefaultColours.greyBackground,
        flexShrink: 0,
    },

    employeeListItemText: {
        minWidth: 0,
    },

    employeeHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 3,
    },

    statsRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        marginBottom: 2,
    },

    statCard: {
        padding: 2,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.smallTextField,
        backgroundColor: DefaultColours.white,
    },

    sectionCard: {
        padding: 2,
        border: `1px solid ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.smallTextField,
        backgroundColor: DefaultColours.white,
        marginTop: 2,
    },

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        gap: 1,
        marginBottom: 1.5,
    },

    payslipRow: {
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 1,
        alignItems: "center",
    },

    emptyState: {
        minHeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        border: `1px dashed ${DefaultColours.greyIconLight}`,
        borderRadius: BorderRadius.mediumNotification,
        backgroundColor: DefaultColours.white,
        padding: 3,
    },

    errorText: {
        color: DefaultColours.redPrimary,
        marginBottom: 2,
    },

    emptyListText: {
        color: DefaultColours.greyPrimaryMainText,
    },
} as const;
