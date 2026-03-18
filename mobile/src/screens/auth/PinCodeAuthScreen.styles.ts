import { StyleSheet } from 'react-native';
import { FontSize, TextStyles } from '../../theme/theme.ts';

export const PinCodeAuthScreen = (theme: any) =>
  StyleSheet.create({
    welcomeBackText: {
      marginTop: -10,
      alignSelf: 'center',
      color: theme.black,
      fontSize: FontSize.m20,
      fontFamily: TextStyles.regular.fontFamily,
      fontWeight: TextStyles.regular.fontWeight
    },
});