import { StyleSheet } from 'react-native';
import { Colours } from '../theme/colours.ts';
import { FontSize, Spacing, TextStyles } from '../theme/theme.ts';

export const topNavStyles = StyleSheet.create({
  container: {
    height: 75,
    paddingHorizontal: Spacing.mediumPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colours.white,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
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
    fontSize: FontSize.l24,
    ...TextStyles.medium,
    color: Colours.black,
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
    backgroundColor: Colours.redPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    fontSize: 9,
    color: Colours.white,
    ...TextStyles.medium,
    lineHeight: 10,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
