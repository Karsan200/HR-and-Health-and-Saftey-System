import { StyleSheet } from 'react-native';
import { BorderRadius, FontSize, Spacing, TextStyles } from '../theme/theme';

/**
 * Styles for the BookLeaveModal component.
 */
export const styles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.greyPrimaryMainText,
      opacity: 0.95,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.largePadding,
    },

    /**
     * Main modal wrapper.
     */
    modalWrapper: {
        justifyContent: 'center',
        paddingHorizontal: Spacing.largePadding,
    },

    /**
     * Modal card container.
     */
    modalContainer: {
      width: '100%',
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      shadowColor: theme.greyIconLight,
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },

    /**
     * Top row of modal.
     */
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.mediumPadding,
    },

    title: {
      fontFamily: TextStyles.medium.fontFamily,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.l24,
      color: theme.black,
    },

    closeButtonWrapper: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },

    closeButtonText: {
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.l24,
      color: theme.greyPrimaryMainText,
    },

    fieldWrapper: {
      marginBottom: Spacing.smallPadding,
    },

    /**
     * Each fields Labels.
     */
    fieldLabel: {
      marginBottom: 6,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.xs14,
      color: theme.greyPrimaryMainText,
    },

    input: {
      borderWidth: 1,
      borderColor: theme.greyIconLight,
      borderRadius: BorderRadius.mediumNotification,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: theme.white,
      color: theme.black,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16,
    },

    /**
     * Input field for notes.
     */
    notesInput: {
      minHeight: 100,
      borderWidth: 1,
      borderColor: theme.greyIconLight,
      borderRadius: BorderRadius.mediumNotification,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: theme.white,
      color: theme.black,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16,
    },

    secondaryText: {
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.xs14,
      color: theme.greyPrimaryMainText,
    },

    /**
     * Warning text shown below form for invalid fields.
     */
    errorText: {
      marginTop: 4,
      marginBottom: 8,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.xs14,
      color: theme.redPrimary,
    },

    /**
     * Submit button.
     */
    submitButton: {
      alignSelf: 'center',
      marginTop: Spacing.smallPadding,
      borderWidth: 1,
      borderColor: theme.redPrimary,
      borderRadius: BorderRadius.mediumNotification,
      backgroundColor: theme.white,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },

    submitButtonText: {
      fontFamily: TextStyles.medium.fontFamily,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.m20,
      color: theme.black,
    },

    /**
     * Trigger button for leave type selection.
     */
    dropdownButton: {
      borderWidth: 1,
      borderColor: theme.greyIconLight,
      borderRadius: BorderRadius.mediumNotification,
      backgroundColor: theme.white,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    dropdownButtonText: {
      flex: 1,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16,
      color: theme.black,
      marginRight: 12,
    },

    dropdownArrow: {
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16,
      color: theme.greyPrimaryMainText,
    },

    /**
     * Leave type picker modal.
     */
    leaveTypeModalWrapper: {
      justifyContent: 'center',
      paddingHorizontal: Spacing.largePadding,
    },

    leaveTypeModalContainer: {
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      shadowColor: theme.greyIconLight,
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 5,
      maxHeight: 420,
    },

    leaveTypeHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.smallPadding,
    },

    leaveTypeModalTitle: {
      fontFamily: TextStyles.medium.fontFamily,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.m20,
      color: theme.black,
    },

    leaveTypeList: {
      maxHeight: 340,
    },

    leaveTypeListContent: {
      paddingBottom: 4,
    },

    leaveTypeOption: {
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: BorderRadius.mediumNotification,
      backgroundColor: theme.white,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.greyIconLight,
    },

    leaveTypeOptionSelected: {
      borderColor: theme.redPrimary,
      backgroundColor: theme.redBackgroundLight,
    },

    leaveTypeOptionText: {
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      fontSize: FontSize.s16,
      color: theme.black,
    },

    leaveTypeOptionTextSelected: {
        color: theme.redTextDark,
    },

    datePickerInput: {
      backgroundColor: theme.white,
    },

    datePickerOutline: {
      borderRadius: BorderRadius.mediumNotification,
    },

    datePickerContent: {
      fontSize: FontSize.s16,
      color: theme.black,
    },
});