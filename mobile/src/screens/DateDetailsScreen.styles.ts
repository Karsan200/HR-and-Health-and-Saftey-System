import { StyleSheet } from 'react-native';
import { colours } from "../theme/colours.ts";
import { theme } from "../theme/theme.ts";

export const dateDetailsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colours.greyBackground,
    },

    content: {
        paddingHorizontal: theme.spacing.largePadding,
        paddingTop: 40,
        paddingBottom: 120,
        gap: 20,
    },

    dateHeader: {
        gap: 8,
    },

    dateText: {
        fontFamily: theme.textStyles.regular.fontFamily,
        fontWeight: theme.textStyles.regular.fontWeight,
        fontSize: 24,
        color: colours.black,
    },

    todayText: {
        color: colours.redPrimary,
    },

    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    weekNavButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 20,
    },

    weekButton: {
        paddingHorizontal: 12,
        paddingVertical: 2,
        backgroundColor: colours.white,
        borderRadius: theme.borderRadius.largeButtonsAndOutlines,
        shadowColor: colours.black,
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    weekButtonText: {
        fontSize: 20,
        color: colours.black,
    },

    dayCard: {
        width: 45,
        height: 70,
        borderRadius: theme.borderRadius.largeButtonsAndOutlines,
        backgroundColor: colours.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colours.black,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    dayCardSelected: {
        backgroundColor: colours.redPrimary,
    },

    dayLabel: {
        fontSize: theme.fontSize.xs14,
        color: colours.greyPrimaryMainText,
    },

    dayLabelSelected: {
        color: colours.white,
    },

    dayNumber: {
        fontSize: 24,
        color: colours.black,
    },

    dayNumberSelected: {
        color: colours.white,
    },

    activityCard: {
        backgroundColor: colours.white,
        borderRadius: 12,
        padding: 12,
        shadowColor: colours.black,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    activityRow: {
        gap: 10,
    },

    activityTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    activityDot: {
        width: 10,
        height: 10,
        backgroundColor: colours.redPrimary,
        borderRadius: 10,
    },

    nameTag: {
        backgroundColor: colours.redBackgroundLight,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },

    nameText: {
        color: colours.redTextDark,
    },

    activitySubtext: {
        fontSize: theme.fontSize.xs14,
        color: colours.black,
        paddingLeft: 20,
    },

    addButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        borderColor: colours.redPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colours.white,
    },

    addIcon: {
        fontSize: 36,
        color: colours.redPrimary,
        marginTop: -2,
    },
});
