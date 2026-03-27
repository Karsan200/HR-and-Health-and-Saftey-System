import { StyleSheet } from 'react-native';
import { Fonts, FontSize, Spacing, TextStyles } from '../theme/theme.ts';

export const topNavStyles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {

  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
  container: {
    height: 75,
    paddingHorizontal: Spacing.mediumPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.greyBackground,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backButton: {
    marginRight: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.l24 * fontScale,
    fontFamily: fontFamilies.regular,
    fontWeight: TextStyles.medium.fontWeight,
    color: theme.black,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  notificationWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: theme.redPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    fontSize: FontSize.xxs12,
    color: theme.white,
    fontFamily: fontFamilies.regular,
    fontWeight: TextStyles.medium.fontWeight,
    lineHeight: 10,
    includeFontPadding: false,
    textAlign: 'center',
  },
  });
};
