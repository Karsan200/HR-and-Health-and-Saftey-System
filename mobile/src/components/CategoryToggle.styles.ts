import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

export const styles = (
    theme: any,
    accessibility: { largeText: boolean; dyslexicFont: boolean }
) => {

    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({

        container: {
            flexDirection: 'row',
            marginHorizontal: Spacing.mediumPadding,
            marginTop: 16,
            marginBottom: 12,
            gap: 10,
        },

        buttonWrapper: {
            flex: 1,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            borderWidth: 2,
            borderColor: 'transparent',
            backgroundColor: theme.white,
            minHeight: 90,
            justifyContent: 'center',
            shadowColor: theme.greyIconLight,
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },

        buttonWrapperActive: {
            borderColor: theme.redPrimary,
        },

        button: {
            paddingVertical: 16,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },

        buttonText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.greyPrimaryMainText,
            textAlign: 'center',
        },

        buttonTextActive: {
            fontWeight: TextStyles.semiBold.fontWeight,
            color: theme.black,
        },

        buttonWrapperCompact: {
            minHeight: 70,
            justifyContent: 'center',
        },

        buttonCompact: {
            paddingVertical: 10,
        },

    });
};