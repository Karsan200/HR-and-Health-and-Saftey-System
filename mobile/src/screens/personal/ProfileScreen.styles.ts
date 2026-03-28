import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, TextStyles, FontSize, Fonts } from '../../theme/theme';

export const profileStyles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.greyBackground,
      alignItems: 'center',
      padding: Spacing.largePadding,
      gap: 20,
    },

    avatar: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
    },

    textContainer: {
      alignItems: 'center',
      gap: 4,
    },

    name: {
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      fontSize: FontSize.xl32 * fontScale,
      color: theme.black,
    },

    role: {
      fontSize: FontSize.m20 * fontScale,
      fontFamily: fontFamilies.regular,
      color: theme.greyPrimaryMainText,
    },

    employeeId: {
      fontSize: FontSize.m20 * fontScale,
      fontFamily: fontFamilies.regular,
      color: theme.greyIconLight,
    },

    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.redPrimary,
      paddingVertical: 0,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
    },

    editText: {
      color: theme.white,
      fontSize: FontSize.xs14 * fontScale,
      fontFamily: fontFamilies.regular,
      paddingLeft: -40,
      paddingRight: 8,
    },

    card: {
      width: '100%',
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      gap: 16,
      elevation: 4,
      shadowColor: theme.black,
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },

    cardTitle: {
      fontSize: FontSize.m20 * fontScale,
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      color: theme.black,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },

    label: {
      fontSize: FontSize.xs14 * fontScale,
      fontFamily: fontFamilies.regular,
      color: theme.greyPrimaryMainText,
    },

    value: {
      fontSize: FontSize.s16 * fontScale,
      fontFamily: fontFamilies.regular,
      color: theme.black,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};