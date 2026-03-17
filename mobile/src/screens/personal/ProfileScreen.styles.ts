import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, TextStyles } from '../../theme/theme';

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
      fontFamily: TextStyles.medium.fontFamily,
      fontWeight: '500',
      fontSize: 32,
      color: theme.black,
    },

    role: {
      fontSize: 20,
      color: theme.greyPrimaryMainText,
    },

    employeeId: {
      fontSize: 14,
      color: theme.greyIconLight,
    },

    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.redPrimary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      gap: 4,
      elevation: 3,
    },

    editText: {
      color: theme.white,
      fontSize: 12,
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
      fontSize: 18,
      fontWeight: '500',
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
      fontSize: 12,
      color: theme.greyPrimaryMainText,
    },

    value: {
      fontSize: 14,
      color: theme.black,
    },
  });
