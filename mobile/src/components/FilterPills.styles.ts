import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, TextStyles } from '../theme/theme';

export const styles = (
    theme: any,
    accessibility: { largeText: boolean; dyslexicFont: boolean }
) => {

    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({

        container: {
            flexDirection: 'row',
            gap: 8,
        },

        pill: {
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            borderWidth: 1,
            borderColor: theme.greyIconLight,
        },

        pillActive: {
            borderColor: theme.redPrimary,
            borderWidth: 1.5,
        },

        text: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.greyPrimaryMainText,
        },

        textActive: {
            fontWeight: TextStyles.semiBold.fontWeight,
            color: theme.black,
        },

    });
};