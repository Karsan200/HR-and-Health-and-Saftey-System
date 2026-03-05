import { StyleSheet } from 'react-native';
import { Colours } from '../../theme/colours';
import { Spacing, FontSize, TextStyles } from '../../theme/theme';

export const settingsStyles = StyleSheet.create({
  /**
   * Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: Spacing.mediumPadding,
    paddingTop: 64,
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
});
