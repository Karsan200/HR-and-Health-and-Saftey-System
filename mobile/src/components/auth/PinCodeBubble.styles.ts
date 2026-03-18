import { StyleSheet } from 'react-native';

export const PinCodeBubbleStyles = (theme: any) =>
  StyleSheet.create({
    enabledBubble: {
      width: 16,
      height: 16,
      borderRadius: 10,
      backgroundColor: theme.black,
    },

    disabledBubble: {
      width: 16,
      height: 16,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.black,
      backgroundColor: theme.white
    }
});