import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, TextStyles, FontSize } from '../../theme/theme';

export const profileStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.greyBackground,
      alignItems: 'center',
      padding: Spacing.largePadding,
      gap: 20,
    },

    avatar: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
    },

    textContainer: {
      alignItems: 'center',
      gap: 4,
    },

    name: {
      ...TextStyles.semiBold,
      fontSize: FontSize.xl32,
      color: theme.black,
    },

    role: {
      fontSize: FontSize.m20,
      color: theme.greyPrimaryMainText,
    },

    employeeId: {
      fontSize: FontSize.m20,
      color: theme.greyIconLight,
    },

    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.redPrimary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      elevation: 3,
    },

    editText: {
      color: theme.white,
      fontSize: FontSize.xs14,
    },

    card: {
      width: '100%',
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      padding: Spacing.mediumPadding,
      gap: 16,
      elevation: 4,
      shadowColor: theme.black,
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },

    cardTitle: {
      fontSize: FontSize.m20,
      ...TextStyles.semiBold,
      color: theme.black,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },

    label: {
      fontSize: FontSize.xs14,
      color: theme.greyPrimaryMainText,
    },

    value: {
      fontSize: FontSize.s16,
      color: theme.black,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
