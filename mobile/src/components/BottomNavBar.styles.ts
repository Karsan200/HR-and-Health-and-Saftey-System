import { StyleSheet } from 'react-native';
import { Spacing, TextStyles } from '../theme/theme';

export const bottomNavStyles = (theme: any) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.smallPadding,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: theme.white,
    backgroundColor: theme.white,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 12,
    ...TextStyles.medium,
    color: theme.greyPrimaryMainText,
    textAlign: 'center',
    marginTop: 4,

  },
  activeNavLabel: {
    color: theme.redPrimary,
  },
});

