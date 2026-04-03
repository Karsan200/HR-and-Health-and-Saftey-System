import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

/**
 * Styles used by the HrPdfCard component.
 */
export const styles = (theme: any, accessibility: { largeText: boolean; dyslexicFont: boolean }) => {
    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({
        /**
         * Main card container. Vertical layout so the PDF viewer
         * can sit beneath the header row when expanded.
         */
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
        },

        /**
         * animation when card is pressed
         */
        cardPressed: {
            opacity: 0.85,
        },

        /**
         * Top row: document icon, text block, action buttons.
         */
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        /**
         * Fixed-width icon container so text always starts at the same x position.
         */
        iconContainer: {
            width: 32,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },

        /**
         * Text block — fills space between icon and actions.
         */
        textContainer: {
            flex: 1,
            justifyContent: 'center',
            gap: 2,
        },

        /**
         * Card title e.g. "January 2026" or "P60 – Tax Year 2024/25".
         */
        title: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.medium.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.black,
            flexShrink: 1,
        },

        /**
         * Subtitle e.g. "Pay Date: 31/01/2026" or "Tax Year 2024/25".
         */
        subtitle: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.greyPrimaryMainText,
        },

        /**
         * P60 badge pill — shrinks to fit its text content.
         */
        p60Badge: {
            backgroundColor: theme.blueLight,
            borderRadius: BorderRadius.smallTextBackground,
            paddingHorizontal: 6,
            paddingVertical: 1,
            alignSelf: 'flex-start',
        },

        /**
         * Text inside the P60 badge.
         */
        p60Text: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.bluePrimary,
        },

        /**
         * Right-side actions container: download icon button.
         */
        actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginLeft: 8,
        },

        /**
         * Touchable wrapper around the download icon.
         */
        downloadButton: {
            padding: 4,
        },

        /**
         * Pressed state for the download button.
         */
        downloadPressed: {
            opacity: 0.6,
        },

        /**
         * Container for the inline PDF viewer.
         * Fixed height so the card expands to a comfortable reading size.
         */
        pdfContainer: {
            marginTop: 12,
            height: 420,
            borderWidth: 1,
            borderColor: theme.greyIconLight,
        },

        /**
         * PDF renderer — fills pdfContainer entirely.
         */
        pdf: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },
    });
};