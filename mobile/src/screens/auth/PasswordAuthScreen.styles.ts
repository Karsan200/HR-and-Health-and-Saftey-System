import { StyleSheet } from 'react-native';
import { Fonts, FontSize, Spacing, TextStyles } from '../../theme/theme.ts';

/** Styles for the Password Authentication Screen, defining layout and visual properties for the screen components. */
export const passwordAuthScreenStyles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {

  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
      /** Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: Spacing.largePadding,
    paddingTop: 40,
    paddingBottom: 40
  },

  /** Logo image styling: fixed dimensions and aspect ratio preservation. */
  image: {
    width: 174,
    height: 54.5,
    resizeMode: 'contain'
  },

  /** Container for the logo image, centers the content. */
  imageContainer: {
    alignItems: 'center',
  },

  /** Primary heading style for the screen title. */
  profileIcon: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  /** Primary heading style for the screen title. */
  inputStyle: {
    marginBottom: 20
  },

  /** Primary heading style for the screen title. */
  forgotPasswordText: {
    marginTop: -10,
    alignSelf: 'center',
    color: theme.greyPrimaryMainText,
    fontSize: FontSize.xs14 * fontScale,
    fontFamily: fontFamilies.regular,
    fontWeight: TextStyles.medium.fontWeight,
  },

  /** Style for error message text in the dialog. */
  dialogText: {
    fontSize: FontSize.s16 * fontScale,
    fontFamily: fontFamilies.regular,
    fontWeight: TextStyles.medium.fontWeight,
    color: theme.black
  }
  });
};