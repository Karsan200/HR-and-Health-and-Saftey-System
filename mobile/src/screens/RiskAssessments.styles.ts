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
         * Root screen container — grey background, fills available space above nav.
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

        /**
         * "Start New Assessment" red button at the top of the list.
         */
        newAssessmentButton: {
            backgroundColor: theme.redPrimary,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            marginHorizontal: Spacing.mediumPadding,
            marginTop: 16,
            marginBottom: 12,
        },

        newAssessmentButtonLabel: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.m20 * fontScale,
            color: theme.white,
        },

        newAssessmentButtonContent: {
            paddingVertical: 6,
        },

        /**
         * FlatList content padding so cards don't sit flush against the edges.
         */
        listContent: {
            paddingHorizontal: Spacing.mediumPadding,
            paddingBottom: 24,
            gap: 12,
        },
    });
};