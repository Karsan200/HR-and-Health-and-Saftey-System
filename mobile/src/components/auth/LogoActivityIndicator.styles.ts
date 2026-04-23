import { StyleSheet } from 'react-native';

export const logoActivityIndicatorStyles = (theme: any) =>
  StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white,
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