import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

export const styles = (
    theme: any,
    accessibility: { largeText: boolean; dyslexicFont: boolean } = {
        largeText: false,
        dyslexicFont: false,
    }
) => {
    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({

        /**
         * Root screen container.
         */
        screen: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },

        /**
         * Loading state — centred spinner.
         */
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.greyBackground,
        },

        /**
         * Error state container.
         */
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: Spacing.mediumPadding,
            backgroundColor: theme.greyBackground,
        },

        errorText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.greyPrimaryMainText,
            textAlign: 'center',
            marginBottom: 12,
        },

        retryText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.redPrimary,
        },

        // Header

        /**
         * Top header row: back arrow + title.
         */
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Spacing.mediumPadding,
            paddingTop: 16,
            paddingBottom: 12,
            gap: 8,
        },

        backButton: {
            padding: 4,
        },

        /**
         * Risk assessment title displayed as the page heading.
         */
        headerTitle: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.m20 * fontScale,
            color: theme.black,
            flex: 1,
        },

        // Filtering Pills
        filterContainer: {
            paddingHorizontal: Spacing.mediumPadding,
            marginBottom: 12,
        },

        // Summary Card

        /**
         * Row of count boxes sitting beneath the filter pills.
         */
        countsRow: {
            flexDirection: 'row',
            paddingHorizontal: Spacing.mediumPadding,
            gap: 10,
            marginBottom: 14,
        },


        // List

        listContent: {
            paddingHorizontal: Spacing.mediumPadding,
            paddingBottom: 24,
            gap: 12,
        },
    });
};