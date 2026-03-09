import { StyleSheet } from 'react-native';
import { Colours } from '../theme/colours';
import { Spacing, FontSize, BorderRadius, TextStyles } from '../theme/theme';

export const homeStyles = StyleSheet.create({
  /**
   * Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: Spacing.mediumPadding,
    paddingTop: 64,
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
    fontSize: FontSize.xl32,
    ...TextStyles.medium,
    textAlign: 'center',
    marginBottom: 4,
  },

  /**
   * Username style displayed beneath the welcome heading.
   */
  userName: {
    fontSize: FontSize.m20,
    ...TextStyles.medium,
    textAlign: 'center',
    marginBottom: 40,
    color: Colours.greyPrimaryMainText,
  },

  /**
   * Section header text style used for the "CHOOSE A SECTION" label.
   */
  sectionTitle: {
    fontSize: FontSize.l24,
    ...TextStyles.semiBold,
    textAlign: 'center',
    color: Colours.greyIconLight,
    marginBottom: 10,
  },

  /**
   * Section button container styling: border, radius and light background.
   */
  sectionButton: {
    borderWidth: 0.6,
    borderColor: Colours.redPrimary,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: Colours.redBackgroundLight,
  },

  /**
   * Inner layout for section button content: fixed height, horizontal padding and row alignment.
   */
  sectionButtonContent: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  /**
   * Text style for labels inside section buttons.
   */
  sectionButtonText: {
    fontSize: FontSize.l24,
    ...TextStyles.semiBold,
    color: Colours.black,
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
    fontSize: FontSize.m20,
    ...TextStyles.semiBold,
    textAlign: 'left',
    color: Colours.greyIconLight,
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
    fontSize: FontSize.s16,
    ...TextStyles.medium,
    textAlign: 'left',
    color: Colours.black,
    marginLeft: 12,
  },
});
