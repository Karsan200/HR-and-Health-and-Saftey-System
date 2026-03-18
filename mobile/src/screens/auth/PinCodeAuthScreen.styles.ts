import { StyleSheet } from 'react-native';
import { FontSize, TextStyles } from '../../theme/theme.ts';

export const PinCodeAuthScreen = (theme: any) =>
  StyleSheet.create({
    welcomeBackText: {
      marginTop: -35,
      alignSelf: 'center',
      color: theme.black,
      fontSize: FontSize.l24,
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
});