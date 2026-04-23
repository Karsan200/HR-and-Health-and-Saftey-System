import { StyleSheet } from 'react-native';
import { DefaultColours } from '../theme/colours.ts';

export const ScreenConfigStyles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: DefaultColours.white,
    },
    content: {
      flex: 1,
    },
  });