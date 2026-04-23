import { StyleSheet } from 'react-native';
import { DefaultColours } from '../../theme/colours.ts';

export const logoActivityIndicatorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DefaultColours.white,
  },
  image: {
    width: 217.5,
    height: 68.1,
    resizeMode: 'contain'
  },
  activityIndicator: {
    marginTop: 50,
  },
});