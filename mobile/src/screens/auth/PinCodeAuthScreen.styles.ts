import { StyleSheet } from 'react-native';
import { Fonts, FontSize, Spacing, TextStyles } from '../../theme/theme.ts';

export const PinCodeAuthScreen = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.largePadding,
      paddingTop: 40,
      paddingBottom: 40,
      backgroundColor: theme.white,
    },

    welcomeBackTextContainer: {
      paddingTop: 40,
    },

    welcomeBackText: {
      alignSelf: 'center',
      color: theme.black,
      fontSize: FontSize.m20 * fontScale,
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight
    },

    bubbleContainer: {
      paddingTop: 16,
      paddingBottom: 16,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    buttonContainer: {
      paddingTop: 10,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    button: {
      width: 80,
      height: 80,
      borderRadius: 100,
      borderWidth: 2,
      borderColor: theme.black,
      backgroundColor: theme.white,
      fontSize: FontSize.l24 * fontScale,
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      textAlign: 'center',
      textAlignVertical: 'center',
      color: theme.black,
    }
  });
};