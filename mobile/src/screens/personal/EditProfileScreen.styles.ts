import { StyleSheet } from 'react-native';
import {
  Spacing,
  BorderRadius,
  TextStyles,
  FontSize,
  Fonts,
} from '../../theme/theme';

export const editProfileStyles = (
  theme: any,
  accessibility: { largeText: boolean; dyslexicFont: boolean },
) => {
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont
    ? Fonts.dyslexic
    : Fonts.poppins;

  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.greyBackground,
      alignItems: 'flex-start',
      paddingHorizontal: Spacing.largePadding,
      paddingBottom: Spacing.mediumPadding,
      gap: Spacing.smallPadding,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.greyBackground,
    },

    // ── Section titles
    sectionTitle: {
      fontFamily: fontFamilies.medium,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.l24 * fontScale,
      color: theme.black,
      marginTop: Spacing.largePadding,
    },

    fieldsGroup: {
      width: '100%',
      gap: Spacing.largePadding,
    },

    fieldCard: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.greyIconLight,
      borderRadius: BorderRadius.mediumNotification,
      paddingHorizontal: Spacing.smallPadding + 2, // 12 px
      paddingTop: Spacing.smallPadding - 1, // 9 px  (matches Figma 9px top)
      paddingBottom: Spacing.smallPadding - 2, // 8 px  (matches Figma 8px bottom)
    },

    fieldLabel: {
      fontFamily: fontFamilies.medium,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.greyPrimaryMainText,
    },

    // Text input inside card
    fieldInput: {
      fontFamily: fontFamilies.regular,
      fontSize: FontSize.s16 * fontScale,
      color: theme.black,
      paddingVertical: 0,
      minHeight: 44,
    },

    // Save button wrapper
    buttonContainer: {
      width: '100%',
      paddingVertical: Spacing.largePadding,
    },

    // Save button
    saveButton: {
      width: '100%',
      backgroundColor: theme.redPrimary,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      paddingVertical: Spacing.smallPadding,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.greyIconLight,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
      minHeight: 60,
    },

    saveButtonPressed: {
      opacity: 0.85,
    },

    // Save button label
    saveButtonText: {
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      fontSize: FontSize.m20 * fontScale,
      color: theme.white,
      letterSpacing: 0.17,
    },
  });
};
