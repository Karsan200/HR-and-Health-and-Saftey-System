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
  const accessibility = themeContext.accessibility;

  const fontScale = accessibility.largeText ? 1.3 : 1;

  const fontFamily = accessibility.dyslexicFont
    ? 'OpenDyslexic'
    : TextStyles.regular.fontFamily;

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
      elevation: {
        level3: theme.greyBackground
      }
    },
    fonts: {
      default: {
        fontFamily,
        fontWeight: TextStyles.regular.fontWeight
      },
      bodySmall: {
        fontFamily,
        fontSize: FontSize.xxs12 * fontScale,
        fontWeight: TextStyles.regular.fontWeight
      },
      bodyMedium: {
        fontFamily,
        fontSize: FontSize.s16 * fontScale,
        fontWeight: TextStyles.regular.fontWeight
      },
      bodyLarge: {
        fontFamily,
        fontSize: FontSize.m20 * fontScale,
        fontWeight: TextStyles.regular.fontWeight
      },
      labelSmall: {
        fontFamily,
        fontSize: FontSize.xxs12 * fontScale,
        fontWeight: TextStyles.medium.fontWeight
      },
      labelMedium: {
        fontFamily,
        fontSize: FontSize.s16 * fontScale,
        fontWeight: TextStyles.medium.fontWeight
      },
      labelLarge: {
        fontFamily,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.medium.fontWeight
      },
      titleSmall: {
        fontFamily,
        fontSize: FontSize.s16 * fontScale,
        fontWeight: TextStyles.semiBold.fontWeight
      },
      titleMedium: {
        fontFamily,
        fontSize: FontSize.m20 * fontScale,
        fontWeight: TextStyles.semiBold.fontWeight
      },
      titleLarge: {
        fontFamily,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.semiBold.fontWeight
      },
      headlineSmall: {
        fontFamily,
        fontSize: FontSize.m20 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      headlineMedium: {
        fontFamily,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      headlineLarge: {
        fontFamily,
        fontSize: FontSize.xl32 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      displaySmall: {
        fontFamily,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      displayMedium: {
        fontFamily,
        fontSize: FontSize.xl32 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight
      },
      displayLarge: {
        fontFamily,
        fontSize: FontSize.xxl36 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight
      }
    },
    animation: {
      scale: 1.0
    }
  }
}