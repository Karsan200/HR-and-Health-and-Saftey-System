import { StyleSheet } from 'react-native';
import {
  BorderRadius,
  Fonts,
  FontSize,
  Spacing,
  TextStyles,
} from '../theme/theme';

export const clockInScreenStyles = (
  theme: any,
  accessibility: { largeText: boolean; dyslexicFont: boolean },
) => {
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont
    ? Fonts.dyslexic
    : Fonts.poppins;

  return StyleSheet.create({
    // Layout
    container: {
      flex: 1,
      backgroundColor: theme.greyBackground,
    },

    scrollContent: {
      padding: Spacing.mediumPadding,
      gap: Spacing.mediumPadding,
      paddingBottom: Spacing.largePadding,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Today's Clock-In Banner
    todayBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      paddingVertical: Spacing.smallPadding + 4,
      paddingHorizontal: Spacing.mediumPadding,
      borderWidth: 1.5,
    },

    todayBannerIn: {
      backgroundColor: theme.greenBackgroundLight,
      borderColor: theme.greenPrimary,
    },

    todayBannerOut: {
      backgroundColor: theme.redBackgroundLight,
      borderColor: theme.redTrafficPrimary,
    },

    todayBannerText: {
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      letterSpacing: 0.17,
    },

    todayBannerTextIn: {
      color: theme.greenPrimary,
    },

    todayBannerTextOut: {
      color: theme.redTrafficPrimary,
    },

    // Yesterday's Activity Card
    activityCard: {
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      paddingHorizontal: 18,
      shadowColor: theme.greyIconLight,
      shadowOpacity: 1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      elevation: 3,
      gap: Spacing.smallPadding,
    },

    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.smallPadding,
    },

    activityTitle: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.l24 * fontScale,
      color: theme.black,
      letterSpacing: 0.17,
    },

    activityContent: {
      paddingTop: Spacing.mediumPadding,
      gap: 4,
    },

    activitySubLabel: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.greyPrimaryMainText,
      letterSpacing: 0.17,
    },

    activityTime: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.xl32 * fontScale,
      color: theme.black,
      letterSpacing: 0.17,
      lineHeight: FontSize.xl32 * fontScale * 1.43,
    },

    activityDate: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.greyPrimaryMainText,
      letterSpacing: 0.17,
      marginBottom: 4,
    },

    divider: {
      height: 1,
      backgroundColor: theme.greyBackground,
      marginVertical: Spacing.smallPadding,
    },

    // Stats Grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.smallPadding,
    },

    statCard: {
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.smallPadding,
      shadowColor: theme.greyIconLight,
      shadowOpacity: 1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      elevation: 3,
      width: '48.5%',
      gap: Spacing.smallPadding,
      justifyContent: 'center',
    },

    statHeader: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      paddingHorizontal: Spacing.smallPadding,
      gap: Spacing.smallPadding,
    },

    statIconBg: {
      width: 25,
      height: 25,
      borderRadius: BorderRadius.smallTextBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    statIconBgRed: {
      backgroundColor: theme.redBackgroundLight,
    },

    statIconBgGreen: {
      backgroundColor: theme.greenBackgroundLight,
    },

    statIconBgGrey: {
      backgroundColor: theme.greyBackground,
    },

    statLabel: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.greyPrimaryMainText,
      letterSpacing: 0.17,
    },

    statValue: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.xxl36 * fontScale,
      letterSpacing: 0.17,
      lineHeight: FontSize.xxl36 * fontScale * 1.43,
      paddingHorizontal: Spacing.smallPadding,
    },

    statValueRed: {
      color: theme.redPrimary,
    },

    statValueGreen: {
      color: theme.greenPrimary,
    },

    statValueDefault: {
      color: theme.black,
    },

    // Report Issue Button
    reportButton: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      paddingVertical: Spacing.mediumPadding,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      borderWidth: 1.5,
      borderColor: theme.redPrimary,
      backgroundColor: theme.white,
    },

    reportButtonText: {
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      fontSize: FontSize.m20 * fontScale,
      color: theme.redPrimary,
      letterSpacing: 0.17,
    },

    // Report Issue Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      padding: Spacing.largePadding,
    },

    modalCard: {
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      gap: Spacing.mediumPadding,
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    modalTitle: {
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      fontSize: FontSize.m20 * fontScale,
      color: theme.black,
      letterSpacing: 0.17,
    },

    modalSubtitle: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.greyPrimaryMainText,
      letterSpacing: 0.17,
      lineHeight: FontSize.s16 * fontScale * 1.5,
    },

    // Dropdown
    pickerWrapper: {
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      overflow: 'hidden',
      justifyContent: 'center',
    },

    pickerLoader: {
      paddingVertical: Spacing.mediumPadding,
    },

    pickerEmptyText: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.greyPrimaryMainText,
      textAlign: 'center',
      paddingVertical: Spacing.mediumPadding,
    },

    dropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.greyBackground,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      paddingHorizontal: Spacing.mediumPadding,
      paddingVertical: Spacing.smallPadding + 4,
    },

    dropdownTriggerText: {
      flex: 1,
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.black,
      letterSpacing: 0.17,
      marginRight: 8,
    },

    dropdownList: {
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      borderWidth: 1,
      borderColor: theme.greyBackground,
      marginTop: 4,
      maxHeight: 200,
      shadowColor: theme.greyIconLight,
      shadowOpacity: 1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      elevation: 3,
      overflow: 'hidden',
    },

    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.mediumPadding,
      paddingVertical: Spacing.smallPadding + 4,
    },

    dropdownItemSelected: {
      backgroundColor: theme.redBackgroundLight,
    },

    dropdownItemText: {
      flex: 1,
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.black,
      letterSpacing: 0.17,
      marginRight: 8,
    },

    dropdownItemTextSelected: {
      color: theme.redPrimary,
      fontFamily: fontFamilies.medium,
      fontWeight: TextStyles.medium.fontWeight,
    },

    dropdownSeparator: {
      height: 1,
      backgroundColor: theme.greyBackground,
    },

    modalInput: {
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.black,
      borderWidth: 1,
      borderColor: theme.greyBackground,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      minHeight: 100,
      backgroundColor: theme.greyBackground,
    },

    modalSubmitButton: {
      backgroundColor: theme.redPrimary,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      paddingVertical: Spacing.mediumPadding,
      alignItems: 'center',
    },

    modalSubmitButtonDisabled: {
      backgroundColor: theme.greyIconLight,
    },

    modalSubmitText: {
      fontFamily: fontFamilies.semiBold,
      fontWeight: TextStyles.semiBold.fontWeight,
      fontSize: FontSize.s16 * fontScale,
      color: theme.white,
      letterSpacing: 0.17,
    },
  });
};
