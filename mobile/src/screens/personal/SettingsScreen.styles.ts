import { StyleSheet } from 'react-native';
import { Spacing, FontSize, TextStyles } from '../../theme/theme';

export const settingsStyles = (theme: any) =>
  StyleSheet.create({
  /**
   * Root container for the screen scroll content.
   * Applies horizontal padding and top offset.
   */
  container: {
    paddingHorizontal: Spacing.mediumPadding,
  },

  /**
   * A Section wrapper for parts of a screen given smaller boxes
   */
  section: {
    marginTop: 16,
    marginBottom: 16,
    padding: Spacing.mediumPadding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.greyIconLight,
    backgroundColor: theme.greyBackground,
  },

  /**
   * Section header text style used for the "CHOOSE A SECTION" label.
   */
  sectionTitle: {
    fontSize: FontSize.l24,
    ...TextStyles.semiBold,
    textAlign: 'center',
    color: theme.greyIconLight,
    marginBottom: 10,
  },

  /**
   * Wrapper for the quick access list with top spacing.
   */
  quickAccessContainer: {
    alignItems: 'stretch',
  },

  /**
   * Title style for the quick access section.
   */
  quickAccessTitle: {
    fontSize: FontSize.m20,
    ...TextStyles.semiBold,
    textAlign: 'left',
    color: theme.greyIconLight,
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
    borderColor: theme.greyIconLight,
    backgroundColor: theme.white,
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
    backgroundColor: "#D20414",
  },

  schemeSwatchBlue: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
    backgroundColor: "#0066FF",
  },

  schemeSwatchGreen: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
    backgroundColor: "#2E7D32",
  },

  schemeSwatchDark: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
    backgroundColor: "#AE010B",
  },

  schemeSwatchCustom: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 10,
    backgroundColor: theme.redPrimary,
  },

  activeScheme: {
    borderWidth: 2,
    borderColor: theme.redPrimary
  },

  /**
   * Label text above colour rows
   */
  label: {
    fontSize: FontSize.m20,
    ...TextStyles.semiBold,
    color: theme.greyIconLight,
    marginTop: 10,
    marginBottom: 6,
  },

  /**
   * Smaller Label
   */
  smallLabel: {
    fontSize: FontSize.s16,
    color: theme.greyIconLight,
    marginVertical: 4,
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
    borderColor: theme.greyIconLight,
    backgroundColor: theme.white,
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
    borderWidth: 2,
    borderColor: theme.greyIconLight,
  },

  activeColourRow: {
    borderWidth: 2,
    borderColor: theme.redPrimary,
  },

  /**
   * Small preview for the picker
   */
  pickerContainer: {
    marginTop: 30,
  },

  /**
   * Dropdown box for the colour picker
   */
  pickerDropdown: {
    marginTop: 32,
    padding: Spacing.mediumPadding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.greyIconLight,
    backgroundColor: theme.greyBackground,
  },

  pickerHeader: {
    fontSize: FontSize.m20,
    ...TextStyles.semiBold,
    textAlign: 'left',
    color: theme.greyIconLight,
    marginBottom: 10,
  },

  previewRow: {
    flexDirection: "row",
    padding: Spacing.mediumPadding,
    borderRadius: 12,
  },

  previewBox: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.black,
    justifyContent: "center",
    alignItems: "center",
  },

  previewText: {
    fontSize: 12,
    color: theme.black,
    margin: 16,
  },
});
