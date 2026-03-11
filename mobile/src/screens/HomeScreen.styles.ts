import { StyleSheet } from 'react-native';
import { colours } from '../theme/colours.ts';
import { theme } from '../theme/theme.ts';

export const homeStyles = StyleSheet.create({
  /**
   * Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: theme.spacing.mediumPadding,
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
    fontSize: theme.fontSize.xl32,
    ...theme.textStyles.medium,
    textAlign: 'center',
    marginBottom: 4,
  },

  /**
   * Username style displayed beneath the welcome heading.
   */
  userName: {
    fontSize: theme.fontSize.m20,
    ...theme.textStyles.medium,
    textAlign: 'center',
    marginBottom: 40,
    color: colours.greyPrimaryMainText,
  },

  /**
   * Section header text style used for the "CHOOSE A SECTION" label.
   */
  sectionTitle: {
    fontSize: theme.fontSize.l24,
    ...theme.textStyles.semiBold,
    textAlign: 'center',
    color: colours.greyIconLight,
    marginBottom: 10,
  },

  /**
   * Section button container styling: border, radius and light background.
   */
  sectionButton: {
    borderWidth: 0.6,
    borderColor: colours.redPrimary,
    borderRadius: theme.borderRadius.largeButtonsAndOutlines,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: colours.redBackgroundLight,
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
    fontSize: theme.fontSize.l24,
    ...theme.textStyles.semiBold,
    color: colours.black,
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
    fontSize: theme.fontSize.m20,
    ...theme.textStyles.semiBold,
    textAlign: 'left',
    color: colours.greyIconLight,
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
    fontSize: theme.fontSize.s16,
    ...theme.textStyles.medium,
    textAlign: 'left',
    color: colours.black,
    marginLeft: 12,
  },
});
