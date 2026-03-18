import { MD3LightTheme } from 'react-native-paper';
import { ThemeProp } from 'react-native-paper/lib/typescript/types';
import { FontSize, TextStyles } from "./theme.ts";
import { ThemeContextType } from "../model/ThemeContextType.ts";

/** Default light theme for react native paper components. <p>
 * Refer to:
 * https://oss.callstack.com/react-native-paper/docs/guides/theming
 * for information on how to edit themes for react native paper components.
 */

export const paperTheme = (themeContext: ThemeContextType): ThemeProp => {
  const theme = themeContext.theme;

  return {
    ...MD3LightTheme, // Default theme, overridden by custom properties below
    dark: false,
    version: 3,
    mode: 'exact',
    roundness: 1.8,
    colors: {
      ...MD3LightTheme.colors, // Default theme, overridden by custom colors below
      primary: theme.redPrimary,
      onSurfaceVariant: theme.greyPrimaryMainText,
      outline: theme.greyIconLight,
      surfaceVariant: theme.white,
      elevation: {
        level3: theme.greyBackground
      }
    },
    fonts: {
      default: {
        fontFamily: TextStyles.regular.fontFamily,
        fontWeight: TextStyles.regular.fontWeight
      },
      bodySmall: {
        fontFamily: TextStyles.regular.fontFamily,
        fontSize: FontSize.xxs12,
        fontWeight: TextStyles.regular.fontWeight
      },
      bodyMedium: {
        fontFamily: TextStyles.regular.fontFamily,
        fontSize: FontSize.s16,
        fontWeight: TextStyles.regular.fontWeight
      },
      bodyLarge: {
        fontFamily: TextStyles.regular.fontFamily,
        fontSize: FontSize.m20,
        fontWeight: TextStyles.regular.fontWeight
      },
      labelSmall: {
        fontFamily: TextStyles.medium.fontFamily,
        fontSize: FontSize.xxs12,
        fontWeight: TextStyles.medium.fontWeight
      },
      labelMedium: {
        fontFamily: TextStyles.medium.fontFamily,
        fontSize: FontSize.s16,
        fontWeight: TextStyles.medium.fontWeight
      },
      labelLarge: {
        fontFamily: TextStyles.medium.fontFamily,
        fontSize: FontSize.l24,
        fontWeight: TextStyles.medium.fontWeight
      },
      titleSmall: {
        fontFamily: TextStyles.semiBold.fontFamily,
        fontSize: FontSize.s16,
        fontWeight: TextStyles.semiBold.fontWeight
      },
      titleMedium: {
        fontFamily: TextStyles.semiBold.fontFamily,
        fontSize: FontSize.m20,
        fontWeight: TextStyles.semiBold.fontWeight
      },
      titleLarge: {
        fontFamily: TextStyles.semiBold.fontFamily,
        fontSize: FontSize.l24,
        fontWeight: TextStyles.semiBold.fontWeight
      },
      headlineSmall: {
        fontFamily: TextStyles.extraBold.fontFamily,
        fontSize: FontSize.m20,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      headlineMedium: {
        fontFamily: TextStyles.extraBold.fontFamily,
        fontSize: FontSize.l24,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      headlineLarge: {
        fontFamily: TextStyles.extraBold.fontFamily,
        fontSize: FontSize.xl32,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      displaySmall: {
        fontFamily: TextStyles.extraBold.fontFamily,
        fontSize: FontSize.l24,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      displayMedium: {
        fontFamily: TextStyles.extraBold.fontFamily,
        fontSize: FontSize.xl32,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      displayLarge: {
        fontFamily: TextStyles.extraBold.fontFamily,
        fontSize: FontSize.xxl36,
        fontWeight: TextStyles.extraBold.fontWeight
      }
    },
    animation: {
      scale: 1.0
    }
  }
}