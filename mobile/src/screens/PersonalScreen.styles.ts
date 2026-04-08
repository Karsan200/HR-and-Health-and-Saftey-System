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