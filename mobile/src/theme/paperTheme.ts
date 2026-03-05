import { ThemeProp } from 'react-native-paper/lib/typescript/types';

import { colours } from './colours.ts';
import { theme } from './theme.ts';

/** Default light theme for react native paper components. <p>
 * Refer to:
 * https://oss.callstack.com/react-native-paper/docs/guides/theming
 * for information on how to edit themes for react native paper components.
 */
export const paperTheme: ThemeProp = {
  dark: false,
  version: 3,
  mode: 'exact',
  roundness: 1.8,
  colors: {
    primary: colours.redPrimary,
    onSurfaceVariant: colours.greyPrimaryMainText,
    outline: colours.greyIconLight
  },
  fonts: {
    default: {
      fontFamily: theme.textStyles.regular.fontFamily,
      fontWeight: theme.textStyles.regular.fontWeight
    },
    bodySmall: {
      fontFamily: theme.textStyles.regular.fontFamily,
      fontSize: theme.fontSize.xxs12,
      fontWeight: theme.textStyles.regular.fontWeight
    },
    bodyMedium: {
      fontFamily: theme.textStyles.regular.fontFamily,
      fontSize: theme.fontSize.s16,
      fontWeight: theme.textStyles.regular.fontWeight
    },
    bodyLarge: {
      fontFamily: theme.textStyles.regular.fontFamily,
      fontSize: theme.fontSize.m20,
      fontWeight: theme.textStyles.regular.fontWeight
    },
    labelSmall: {
      fontFamily: theme.textStyles.medium.fontFamily,
      fontSize: theme.fontSize.xxs12,
      fontWeight: theme.textStyles.medium.fontWeight
    },
    labelMedium: {
      fontFamily: theme.textStyles.medium.fontFamily,
      fontSize: theme.fontSize.s16,
      fontWeight: theme.textStyles.medium.fontWeight
    },
    labelLarge: {
      fontFamily: theme.textStyles.medium.fontFamily,
      fontSize: theme.fontSize.l24,
      fontWeight: theme.textStyles.medium.fontWeight
    },
    titleSmall: {
      fontFamily: theme.textStyles.semiBold.fontFamily,
      fontSize: theme.fontSize.s16,
      fontWeight: theme.textStyles.semiBold.fontWeight
    },
    titleMedium: {
      fontFamily: theme.textStyles.semiBold.fontFamily,
      fontSize: theme.fontSize.m20,
      fontWeight: theme.textStyles.semiBold.fontWeight
    },
    titleLarge: {
      fontFamily: theme.textStyles.semiBold.fontFamily,
      fontSize: theme.fontSize.l24,
      fontWeight: theme.textStyles.semiBold.fontWeight
    },
    headlineSmall: {
      fontFamily: theme.textStyles.extraBold.fontFamily,
      fontSize: theme.fontSize.m20,
      fontWeight: theme.textStyles.extraBold.fontWeight
    },
    headlineMedium: {
      fontFamily: theme.textStyles.extraBold.fontFamily,
      fontSize: theme.fontSize.l24,
      fontWeight: theme.textStyles.extraBold.fontWeight
    },
    headlineLarge: {
      fontFamily: theme.textStyles.extraBold.fontFamily,
      fontSize: theme.fontSize.xl32,
      fontWeight: theme.textStyles.extraBold.fontWeight
    },
    displaySmall: {
      fontFamily: theme.textStyles.extraBold.fontFamily,
      fontSize: theme.fontSize.l24,
      fontWeight: theme.textStyles.extraBold.fontWeight
    },
    displayMedium: {
      fontFamily: theme.textStyles.extraBold.fontFamily,
      fontSize: theme.fontSize.xl32,
      fontWeight: theme.textStyles.extraBold.fontWeight
    },
    displayLarge: {
      fontFamily: theme.textStyles.extraBold.fontFamily,
      fontSize: theme.fontSize.xxl36,
      fontWeight: theme.textStyles.extraBold.fontWeight
    }
  }
}