import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme.ts';
import { colours } from '../../theme/colours.ts';

/** Styles for the Password Authentication Screen, defining layout and visual properties for the screen components. */
export const passwordAuthScreenStyles = StyleSheet.create({
  /** Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: theme.spacing.largePadding,
    paddingTop: 100,
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
    color: colours.greyPrimaryMainText,
    fontSize: theme.fontSize.xs14,
    fontFamily: theme.textStyles.regular.fontFamily,
    fontWeight: theme.textStyles.regular.fontWeight
  }
});
