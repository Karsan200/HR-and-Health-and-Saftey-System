import { StyleSheet } from 'react-native';
import { Colours } from '../theme/colours';
import { Spacing, TextStyles } from '../theme/theme';

export const bottomNavStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.smallPadding,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colours.white,
    backgroundColor: Colours.white,
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
    color: Colours.greyPrimaryMainText,
    textAlign: 'center',
    marginTop: 4,

  },
  activeNavLabel: {
    color: Colours.redPrimary,
  },
});

