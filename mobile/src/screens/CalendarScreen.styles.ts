import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme.ts';

export const calendarScreenStyles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {

  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.greyBackground,
    },

    summaryWrapper: {
        paddingTop: Spacing.largePadding,
        marginBottom: Spacing.largePadding,
    },

    calendarContainer: {
        marginHorizontal: Spacing.largePadding,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        backgroundColor: theme.white,
        padding: Spacing.smallPadding,
        shadowColor: theme.black,
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },

    redStripe: {
        height: 2,
        backgroundColor: theme.redPrimary,
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
        backgroundColor: theme.redPrimary,
        borderRadius: 100,
    },

    partialBookedCircle: {
        width: 13,
        height: 13,
        backgroundColor: theme.amberPrimary,
        borderRadius: 100,
    },

    keyText: {
        fontFamily: fontFamilies.regular,
        fontWeight: TextStyles.medium.fontWeight,
        fontSize: FontSize.xs14 * fontScale,
        color: theme.black,
    },
  });
};