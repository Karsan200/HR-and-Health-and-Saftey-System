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

        // Filtering Pills

        statusFilterContainer: {
            flexDirection: 'row',
            paddingHorizontal: Spacing.mediumPadding,
            gap: 8,
            marginBottom: 12,
        },

        // List view

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

        // Icons

        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },

        iconContainerUnsigned: {
            backgroundColor: theme.redTrafficBackgroundLight,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
        },

        iconContainerSigned: {
            backgroundColor: theme.greenBackgroundLight,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
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

        // Badges for signed/unsigned status

        signedBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            alignSelf: 'flex-start',
            backgroundColor: theme.greenBackgroundLight,
            borderRadius: BorderRadius.mediumNotification,
            paddingHorizontal: 6,
            paddingVertical: 2,
        },

        signedBadgeText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.greenPrimary,
        },

        unsignedBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            alignSelf: 'flex-start',
            backgroundColor: theme.redTrafficBackgroundLight,
            borderRadius: BorderRadius.mediumNotification,
            paddingHorizontal: 6,
            paddingVertical: 2,
        },

        unsignedBadgeText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xxs12 * fontScale,
            color: theme.redTrafficPrimary,
        },

        // PDF viewer

        pdfScreen: {
            flex: 1,
            backgroundColor: theme.greyBackground,
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

        acknowledgeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: Spacing.mediumPadding,
            marginBottom: 24,
            backgroundColor: theme.white,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            paddingVertical: 12,
            paddingHorizontal: Spacing.mediumPadding,
            shadowColor: theme.greyIconLight,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 4,
        },

        acknowledgeText: {
            fontFamily: fontFamilies.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.s16 * fontScale,
            color: theme.black,
            flex: 1,
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

        buttonWrapperCompact: {
            minHeight: 55,
        },

        buttonCompact: {
            paddingVertical: 10,
        },

    });
};