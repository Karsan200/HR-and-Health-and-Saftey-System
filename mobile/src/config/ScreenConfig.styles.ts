import { StyleSheet } from 'react-native';

export const ScreenConfigStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    content: {
      flex: 1,
    },
  });