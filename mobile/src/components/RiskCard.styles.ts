import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

/**
 * Styles for the shared AssessmentCard component.
 * Used on both the Risk Assessment list and the Hazard list screens.
 */
export const styles = (theme: any, accessibility: { largeText: boolean; dyslexicFont: boolean }) => {
    const fontScale = accessibility.largeText ? 1.3 : 1;
    const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

    return StyleSheet.create({
        /**
         * Outer card container — white, rounded, with a soft shadow.
         */
        card: {
            backgroundColor: theme.white,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            paddingVertical: Spacing.mediumPadding,
            paddingHorizontal: Spacing.mediumPadding,
            marginBottom: Spacing.mediumPadding,
            shadowColor: theme.greyIconLight,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },

        // Status Badge

        /**
         * Pill container. Sits above the title when a status is provided.
         */
        badge: {
            alignSelf: 'flex-start',
            borderRadius: BorderRadius.smallTextBackground,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginBottom: 6,
        },

        badgeDraft: {
            backgroundColor: theme.greyIconLight,
        },

        badgeSubmitted: {
            backgroundColor: theme.amberBackgroundLight,
        },

        badgeClosed: {
            backgroundColor: theme.greenBackgroundLight,
        },

        /**
         * Text inside the status badge pill.
         */
        badgeText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
        },

        badgeTextDraft: {
            color: theme.greyPrimaryMainText,
        },

        badgeTextSubmitted: {
            color: theme.amberTextDark,
        },

        badgeTextClosed: {
            color: theme.greenTextDark,
        },

        // Text Layer

        /**
         * Primary heading — assessment or hazard title.
         */
        title: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.m20 * fontScale,
            color: theme.black,
            marginBottom: 2,
        },

        /**
         * Sub-heading — hazard count on risk page, assessor name on hazard page.
         */
        subheading: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.greyPrimaryMainText,
            marginBottom: 2,
        },

        /**
         * Date text — e.g. "28 Jan, 2026".
         */
        date: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.greyPrimaryMainText,
            marginBottom: Spacing.mediumPadding,
        },
    });
};