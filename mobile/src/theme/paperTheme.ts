import { MD3LightTheme } from 'react-native-paper';
import { ThemeProp } from 'react-native-paper/lib/typescript/types';
import { FontSize, TextStyles, Fonts } from "./theme.ts";
import { ThemeContextType } from "../model/ThemeContextType.ts";

/**
 * Default light theme for React Native Paper components.
 * Now supports accessibility settings: large text & dyslexic font.
 */
export const paperTheme = (themeContext: ThemeContextType): ThemeProp => {
  const theme = themeContext.theme;
  const accessibility = themeContext.accessibility;

  // Text scaling for large text
  const fontScale = accessibility.largeText ? 1.3 : 1;

  // Choose font families dynamically
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return {
    ...MD3LightTheme,
    dark: false,
    version: 3,
    mode: 'exact',
    roundness: 1.8,
    colors: {
      ...MD3LightTheme.colors,
      primary: theme.redPrimary,
      onSurfaceVariant: theme.greyPrimaryMainText,
      outline: theme.greyIconLight,
      elevation: {
        level3: theme.greyBackground,
      },
    },
    fonts: {
      default: {
        fontFamily: fontFamilies.regular,
        fontWeight: TextStyles.regular.fontWeight,
      },
      bodySmall: {
        fontFamily: fontFamilies.regular,
        fontSize: FontSize.xxs12 * fontScale,
        fontWeight: TextStyles.regular.fontWeight,
      },
      bodyMedium: {
        fontFamily: fontFamilies.regular,
        fontSize: FontSize.s16 * fontScale,
        fontWeight: TextStyles.regular.fontWeight,
      },
      bodyLarge: {
        fontFamily: fontFamilies.regular,
        fontSize: FontSize.m20 * fontScale,
        fontWeight: TextStyles.regular.fontWeight,
      },
      labelSmall: {
        fontFamily: fontFamilies.medium,
        fontSize: FontSize.xxs12 * fontScale,
        fontWeight: TextStyles.medium.fontWeight,
      },
      labelMedium: {
        fontFamily: fontFamilies.medium,
        fontSize: FontSize.s16 * fontScale,
        fontWeight: TextStyles.medium.fontWeight,
      },
      labelLarge: {
        fontFamily: fontFamilies.medium,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.medium.fontWeight,
      },
      titleSmall: {
        fontFamily: fontFamilies.semiBold,
        fontSize: FontSize.s16 * fontScale,
        fontWeight: TextStyles.semiBold.fontWeight,
      },
      titleMedium: {
        fontFamily: fontFamilies.semiBold,
        fontSize: FontSize.m20 * fontScale,
        fontWeight: TextStyles.semiBold.fontWeight,
      },
      titleLarge: {
        fontFamily: fontFamilies.semiBold,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.semiBold.fontWeight,
      },
      headlineSmall: {
        fontFamily: fontFamilies.extraBold,
        fontSize: FontSize.m20 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight,
      },
      headlineMedium: {
        fontFamily: fontFamilies.extraBold,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight,
      },
      headlineLarge: {
        fontFamily: fontFamilies.extraBold,
        fontSize: FontSize.xl32 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight,
      },
      displaySmall: {
        fontFamily: fontFamilies.extraBold,
        fontSize: FontSize.l24 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight,
      },
      displayMedium: {
        fontFamily: fontFamilies.extraBold,
        fontSize: FontSize.xl32 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight,
      },
      displayLarge: {
        fontFamily: fontFamilies.extraBold,
        fontSize: FontSize.xxl36 * fontScale,
        fontWeight: TextStyles.extraBold.fontWeight,
      },
    },
    animation: {
      scale: 1.0,
    },
  };
};