import { StyleSheet } from 'react-native';
import { Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

export const bottomNavStyles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {

  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
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
    fontSize: FontSize.xxs12 * fontScale,
    fontFamily: fontFamilies.regular,
    fontWeight: TextStyles.medium.fontWeight,
    color: theme.greyPrimaryMainText,
    textAlign: 'center',
    marginTop: 4,

  },
  activeNavLabel: {
    color: theme.redPrimary,
  },
  });
};

