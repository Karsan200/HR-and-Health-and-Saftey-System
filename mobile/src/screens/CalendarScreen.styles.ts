import { StyleSheet } from 'react-native';
import { colours } from "../theme/colours.ts";
import { theme } from "../theme/theme.ts";

export const calendarScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colours.greyBackground,
    },

    summaryWrapper: {
        paddingTop: theme.spacing.largePadding,
        marginBottom: theme.spacing.largePadding,
    },

    calendarContainer: {
        marginHorizontal: theme.spacing.largePadding,
        borderRadius: theme.borderRadius.largeButtonsAndOutlines,
        backgroundColor: colours.white,
        padding: theme.spacing.smallPadding,
        shadowColor: colours.black,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },

    redStripe: {
        height: 2,
        backgroundColor: colours.redPrimary,
        marginVertical: 6,
        borderRadius: 1,
    },

    keyContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingVertical: 10,
    },

    keyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    fullyBookedCircle: {
        width: 13,
        height: 13,
        backgroundColor: colours.redPrimary,
        borderRadius: 100,
    },

    partialBookedCircle: {
        width: 13,
        height: 13,
        backgroundColor: colours.amberPrimary,
        borderRadius: 100,
    },

    keyText: {
        fontFamily: theme.textStyles.medium.fontFamily,
        fontWeight: theme.textStyles.medium.fontWeight,
        fontSize: theme.fontSize.xs14,
        color: colours.black,
    },
});
