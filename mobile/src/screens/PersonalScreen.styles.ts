import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

export const styles = (theme: any, accessibility: { largeText: boolean; dyslexicFont: boolean }) => {

    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({

        screen: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },

        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.greyBackground,
        },

        // Category toggle
        categoryToggleContainer: {
            flexDirection: 'row',
            marginHorizontal: Spacing.mediumPadding,
            marginTop: 16,
            marginBottom: 12,
            gap: 10,
        },

        categoryButtonWrapper: {
            flex: 1,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            borderWidth: 2,
            borderColor: 'transparent',
            backgroundColor: theme.white,
            minHeight: 70,
        },

        categoryButtonWrapperActive: {
            borderColor: theme.redPrimary,
        },

        categoryButton: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },

        categoryButtonText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.greyPrimaryMainText,
            textAlign: 'center',
            flexShrink: 1,
        },

        categoryButtonTextActive: {
            fontWeight: TextStyles.semiBold.fontWeight,
            color: theme.black,
        },

        // List
        listContent: {
            paddingHorizontal: Spacing.mediumPadding,
            paddingBottom: 24,
            gap: 10,
        },

        // Card
        card: {
            backgroundColor: theme.white,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            paddingVertical: 14,
            paddingHorizontal: Spacing.mediumPadding,
            shadowColor: theme.greyIconLight,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
            gap: 12,
        },

        cardHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
        },

        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: theme.greyBackground,
            alignItems: 'center',
            justifyContent: 'center',
        },

        cardTextContainer: {
            flex: 1,
            gap: 3,
        },

        cardTitle: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.black,
        },

        cardSubtitle: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.greyPrimaryMainText,
        },

        // View button
        viewButton: {
            backgroundColor: theme.redPrimary,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
        },

        buttonLabel: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xs14 * fontScale,
            color: theme.white,
        },

        buttonContent: {
            paddingVertical: 4,
        },

        // PDF viewer
        pdfScreen: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },

        pdfHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Spacing.mediumPadding,
            paddingVertical: 12,
            backgroundColor: theme.greyBackground,
            gap: 8,
        },

        backButton: {
            padding: 4,
        },

        pdfHeaderTitle: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.black,
            flex: 1,
        },

        pdfContainer: {
            flex: 1,
            marginHorizontal: Spacing.mediumPadding,
            marginTop: 12,
            marginBottom: 8,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            overflow: 'hidden',
            backgroundColor: theme.white,
            shadowColor: theme.greyIconLight,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },

        pdf: {
            flex: 1,
            backgroundColor: theme.white,
        },

        licenceContainer: {
            paddingHorizontal: Spacing.mediumPadding,
            paddingTop: 4,
        },

    });
};