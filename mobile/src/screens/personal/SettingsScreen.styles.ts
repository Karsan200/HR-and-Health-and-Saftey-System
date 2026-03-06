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
   * A Section wrapper for parts of a screen given smaller boxes
   */
  section: {
    marginTop: 32,
    padding: Spacing.mediumPadding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colours.greyIconLight,
    backgroundColor: Colours.greyBackground,
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

  /**
   * Grid container for the colour scheme buttons
   */
  schemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  /**
   * Individual scheme button
   */
  schemeButton: {
    width: '48%',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colours.greyIconLight,
    backgroundColor: Colours.white,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  /**
   * Small colour square inside scheme buttons
   */
  schemeSwatch: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
  },

  /**
   * Label text above colour rows
   */
  label: {
    fontSize: FontSize.m20,
    ...TextStyles.semiBold,
    color: Colours.greyIconLight,
    marginTop: 10,
    marginBottom: 6,
  },

  /**
   * Row containing colour preview and hex value
   */
  colourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colours.greyIconLight,
    backgroundColor: Colours.white,
    marginBottom: 12,
  },

  /**
   * Small preview square showing the colour
   */
  colourPreview: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colours.greyIconLight,
  },
});
