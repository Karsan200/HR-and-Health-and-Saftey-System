import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, TextStyles } from '../theme/theme';

export const styles = (theme: any, accessibility: { largeText: boolean; dyslexicFont: boolean }) => {
    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            paddingVertical: 6,
            paddingHorizontal: 12,
            minHeight: 50,
        },
        label: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xs14 * fontScale,
            color: theme.white,
            marginLeft: 6,
        },
        active: {
            backgroundColor: theme.redPrimary,
        },
        inactive: {
            backgroundColor: theme.greyPrimaryMainText,
        },
    });
};