import { StyleSheet } from 'react-native';
import { Spacing, FontSize, BorderRadius, TextStyles, Fonts } from '../theme/theme';

export const homeStyles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {

  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;
  const buttonHeight = accessibility.largeText ? 88 : 60;

  return StyleSheet.create({
  /**
   * Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: Spacing.mediumPadding,
    paddingTop: 64,
    backgroundColor: theme.white,
  },

  /**
   * Profile icon container.
   * Centers the icon and provides spacing.
   */
  profileIcon: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },

  /**
   * Primary welcome heading style.
   */
  welcomeText: {
    fontSize: FontSize.xl32 * fontScale,
    fontWeight: TextStyles.medium.fontWeight,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginBottom: 4,
    color: theme.black,
  },

  /**
   * Username style displayed beneath the welcome heading.
   */
  userName: {
    fontSize: FontSize.m20 * fontScale,
    fontWeight: TextStyles.medium.fontWeight,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    marginBottom: 40,
    color: theme.greyPrimaryMainText,
  },

  /**
   * Section header text style used for the "CHOOSE A SECTION" label.
   */
  sectionTitle: {
    fontSize: FontSize.l24 * fontScale,
    fontWeight: TextStyles.semiBold.fontWeight,
    fontFamily: fontFamilies.regular,
    textAlign: 'center',
    color: theme.greyIconLight,
    marginBottom: 10,
  },

  /**
   * Section button container styling: border, radius and light background.
   */
  sectionButton: {
    borderWidth: 0.6,
    borderColor: theme.redPrimary,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: theme.redBackgroundLight,
  },

  /**
   * Inner layout for section button content: fixed height, horizontal padding and row alignment.
   */
  sectionButtonContent: {
    minHeight: buttonHeight,
    paddingHorizontal: 16,
    paddingVertical: accessibility.largeText ? 14 : 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  /**
   * Text style for labels inside section buttons.
   */
  sectionButtonText: {
    fontSize: FontSize.l24 * fontScale,
    fontWeight: TextStyles.semiBold.fontWeight,
    fontFamily: fontFamilies.regular,
    color: theme.black,
    textAlign: 'left',
    marginLeft: 12,
  },

  /**
   * Normalizes margin for icon buttons used across the screen.
   */
  iconButton: {
    margin: 0,
  },

  /**
   * Wrapper for the quick access list with top spacing.
   */
  quickAccessContainer: {
    marginTop: 40,
    alignItems: 'stretch',
  },

  /**
   * Title style for the quick access section.
   */
  quickAccessTitle: {
    fontSize: FontSize.m20 * fontScale,
    fontWeight: TextStyles.semiBold.fontWeight,
    fontFamily: fontFamilies.regular,
    textAlign: 'left',
    color: theme.greyIconLight,
    marginBottom: 10,
  },

  /**
   * Container for each quick access row; stretches to available width.
   */
  quickAccessButtonContainer: {
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: 6,
  },

  /**
   * Row layout and alignment for quick access items (icon + label).
   */
  quickAccessButtonContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /**
   * Text style for quick access item labels.
   */
  quickAccessButton: {
    fontSize: FontSize.s16 * fontScale,
    fontWeight: TextStyles.medium.fontWeight,
    fontFamily: fontFamilies.regular,
    textAlign: 'left',
    color: theme.black,
    marginLeft: 12,
  },
  });
};