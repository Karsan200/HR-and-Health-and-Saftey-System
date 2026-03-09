import { StyleSheet } from 'react-native';
import { colours } from '../theme/colours.ts';
import { theme } from '../theme/theme.ts';

export const topNavStyles = StyleSheet.create({
  container: {
    height: 75,
    paddingHorizontal: theme.spacing.mediumPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colours.white,
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
    fontSize: theme.fontSize.l24,
    ...theme.textStyles.medium,
    color: colours.black,
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
    backgroundColor: colours.redPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    fontSize: 9,
    color: colours.white,
    ...theme.textStyles.medium,
    lineHeight: 10,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
