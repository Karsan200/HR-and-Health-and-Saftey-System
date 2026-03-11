import { StyleSheet } from 'react-native';
import { colours } from '../theme/colours';
import { theme } from '../theme/theme';

export const bottomNavStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.smallPadding,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colours.white,
    backgroundColor: colours.white,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 12,
    ...theme.textStyles.medium,
    color: colours.greyPrimaryMainText,
    textAlign: 'center',
    marginTop: 4,

  },
  activeNavLabel: {
    color: colours.redPrimary,
  },
});

