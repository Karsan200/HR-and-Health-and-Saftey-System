import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme.ts';
import { colours } from '../../theme/colours.ts';

export const passwordAuthScreenStyles = StyleSheet.create({
  /**
   * Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: theme.spacing.largePadding,
    paddingTop: 100,
  },

  image: {
    width: 174,
    height: 54.5,
    resizeMode: 'contain'
  },

  imageContainer: {
    alignItems: 'center',
  },

  profileIcon: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  inputStyle: {
    marginBottom: 20
  },

  forgotPasswordText: {
    marginTop: -10,
    alignSelf: 'center',
    color: colours.greyPrimaryMainText,
    fontSize: theme.fontSize.xs14,
    fontFamily: theme.textStyles.regular.fontFamily,
    fontWeight: theme.textStyles.regular.fontWeight
  }
});
