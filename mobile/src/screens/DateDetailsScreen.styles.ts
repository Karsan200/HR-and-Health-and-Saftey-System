import { StyleSheet } from 'react-native';
import {BorderRadius, FontSize, Spacing, TextStyles} from "../theme/theme";

export const dateDetailsStyles = (theme: any) =>
  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colours.greyBackground,
    },

    content: {
        paddingHorizontal: Spacing.largePadding,
        paddingTop: 40,
        paddingBottom: 120,
        gap: 20,
    },

    dateHeader: {
        gap: 8,
    },

    dateText: {
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight,
        fontSize: 24,
        color: theme.black,
    },

    todayText: {
        color: theme.redPrimary,
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
        backgroundColor: theme.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        shadowColor: theme.black,
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    weekButtonText: {
        fontSize: 20,
        color: theme.black,
    },

    dayCard: {
        width: 45,
        height: 70,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        backgroundColor: theme.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.black,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    dayCardSelected: {
        backgroundColor: theme.redPrimary,
    },

    dayLabel: {
        fontSize: FontSize.xs14,
        color: theme.greyPrimaryMainText,
    },

    dayLabelSelected: {
        color: theme.white,
    },

    dayNumber: {
        fontSize: 24,
        color: theme.black,
    },

    dayNumberSelected: {
        color: theme.white,
    },

    activityCard: {
        backgroundColor: theme.white,
        borderRadius: 12,
        padding: 12,
        shadowColor: theme.black,
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
        backgroundColor: theme.redPrimary,
        borderRadius: 10,
    },

    nameTag: {
        backgroundColor: theme.redBackgroundLight,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },

    nameText: {
        color: theme.redTextDark,
    },

    activitySubtext: {
        fontSize: FontSize.xs14,
        color: theme.black,
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
        borderColor: theme.redPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.white,
    },

    addIcon: {
        fontSize: 36,
        color: theme.redPrimary,
        marginTop: -2,
    },
});
