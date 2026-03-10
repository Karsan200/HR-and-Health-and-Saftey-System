import { StyleSheet } from 'react-native';
import {Colours} from "../theme/colours.ts";
import {BorderRadius, FontSize, Spacing, TextStyles} from "../theme/theme.ts";

export const dateDetailsStyles = StyleSheet.create({
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
        color: Colours.black,
    },

    todayText: {
        color: Colours.redPrimary,
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
        backgroundColor: Colours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        shadowColor: Colours.black,
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },

    weekButtonText: {
        fontSize: 20,
        color: Colours.black,
    },

    dayCard: {
        width: 45,
        height: 70,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        backgroundColor: Colours.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colours.black,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    dayCardSelected: {
        backgroundColor: Colours.redPrimary,
    },

    dayLabel: {
        fontSize: FontSize.xs14,
        color: Colours.greyPrimaryMainText,
    },

    dayLabelSelected: {
        color: Colours.white,
    },

    dayNumber: {
        fontSize: 24,
        color: Colours.black,
    },

    dayNumberSelected: {
        color: Colours.white,
    },

    activityCard: {
        backgroundColor: Colours.white,
        borderRadius: 12,
        padding: 12,
        shadowColor: Colours.black,
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
        backgroundColor: Colours.redPrimary,
        borderRadius: 10,
    },

    nameTag: {
        backgroundColor: Colours.redBackgroundLight,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },

    nameText: {
        color: Colours.redTextDark,
    },

    activitySubtext: {
        fontSize: FontSize.xs14,
        color: Colours.black,
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
        borderColor: Colours.redPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colours.white,
    },

    addIcon: {
        fontSize: 36,
        color: Colours.redPrimary,
        marginTop: -2,
    },
});
