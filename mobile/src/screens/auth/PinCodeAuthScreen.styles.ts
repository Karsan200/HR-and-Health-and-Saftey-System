import { StyleSheet } from 'react-native';
import { FontSize, Spacing, TextStyles } from '../../theme/theme.ts';

export const PinCodeAuthScreen = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.largePadding,
      paddingTop: 40,
    },

    welcomeBackText: {
      marginTop: -35,
      alignSelf: 'center',
      color: theme.black,
      fontSize: FontSize.m20,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight
    },

    bubbleContainer: {
      paddingTop: 16,
      paddingBottom: 16,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    buttonContainer: {
      paddingTop: 10,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    button: {
      width: 80,
      height: 80,
      borderRadius: 100,
      borderWidth: 2,
      borderColor: theme.black,
      backgroundColor: theme.white,
      fontSize: FontSize.l24,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight,
      textAlign: 'center',
      textAlignVertical: 'center',
    }
});