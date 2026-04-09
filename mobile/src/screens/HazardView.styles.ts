import { StyleSheet } from 'react-native';
import { FontSize, BorderRadius, TextStyles, Fonts } from '../theme/theme';

export const styles = (theme: any, accessibility: { largeText: boolean; dyslexicFont: boolean }) => {
    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({

        // Layout
        screen: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },
        container: {
            paddingTop: 24,
            paddingBottom: 48,
            backgroundColor: theme.greyBackground,
        },
        spacer: {
            height: 4,
        },
        bottomSpacer: {
            height: 40,
        },
        centeredContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.greyBackground,
            padding: 24,
        },

        // Card
        card: {
            backgroundColor: theme.white,
            marginHorizontal: 16,
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            shadowColor: theme.greyIconLight,
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
        },
        cardTitle: {
            fontSize: FontSize.m20 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
            color: theme.black,
            marginBottom: 8,
        },

        // Read only field
        fieldWrapper: {
            marginBottom: 12,
        },
        fieldLabel: {
            color: theme.greyPrimaryMainText,
            marginBottom: 6,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
        },
        // Mimics the outlined TextInput but with a grey fill to signal read-only
        fieldBox: {
            borderWidth: 1,
            borderColor: theme.greyIconLight,
            borderRadius: BorderRadius.smallTextField,
            backgroundColor: theme.greyBackground,
            paddingHorizontal: 12,
            paddingVertical: 10,
            minHeight: 44,
        },
        fieldValue: {
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            color: theme.greyPrimaryMainText,
        },

        // Checkbox row
        checkboxRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
            marginBottom: 8,
        },
        checkboxLabel: {
            color: theme.greyPrimaryMainText,
            marginLeft: 8,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
        },
        // Dimmed when the hazard is closed and fully locked
        checkboxLabelDisabled: {
            color: theme.greyIconLight,
        },

        // Error
        errorText: {
            color: theme.redTrafficPrimary,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            textAlign: 'center',
            marginBottom: 12,
        },
        retryButton: {
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            borderWidth: 1,
            borderColor: theme.redPrimary,
        },
        retryText: {
            color: theme.redPrimary,
            fontSize: FontSize.xs14 * fontScale,
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
        },
    });
};