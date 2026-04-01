import { StyleSheet } from 'react-native';
import { BorderRadius, Fonts, FontSize, Spacing, TextStyles } from '../theme/theme';

export const styles = (theme: any, _accessibility?: { largeText: boolean; dyslexicFont: boolean }) => {
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

        pdfScreen: {
            flex: 1,
            backgroundColor: theme.black,
        },

        // Category buttons

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

        categoryButtonLeft: {},

        categoryButtonRight: {},

        categoryButtonActive: {
            borderColor: theme.redPrimary,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            zIndex: 1,
        },

        categoryButtonText: {
            fontFamily: Fonts.poppins.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.s16,
            color: theme.greyPrimaryMainText,
            textAlign: 'center',
            flexShrink: 1,
        },

        categoryButtonTextActive: {
            fontWeight: TextStyles.semiBold.fontWeight,
            color: theme.black,
        },

        // Filtering Pills

        statusFilterContainer: {
            flexDirection: 'row',
            paddingHorizontal: Spacing.mediumPadding,
            gap: 8,
            marginBottom: 12,
        },

        statusPill: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
            borderWidth: 1,
            borderColor: theme.greyIconLight,
        },

        statusPillActive: {
            borderColor: theme.redPrimary,
            borderWidth: 1.5,
        },

        statusPillText: {
            fontFamily: Fonts.poppins.regular,
            fontSize: FontSize.xxs12,
            color: theme.greyPrimaryMainText,
        },

        statusPillTextActive: {
            fontWeight: TextStyles.semiBold.fontWeight,
            color: theme.black,
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

        //icons

        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },

        iconContainerUnsigned: {
            backgroundColor: theme.redTrafficBackgroundLight,
            borderRadius: BorderRadius.largeButtonsAndOutlines
        },

        iconContainerSigned: {
            backgroundColor: theme.greenBackgroundLight,
            borderRadius: BorderRadius.largeButtonsAndOutlines
        },

        cardTextContainer: {
            flex: 1,
            gap: 3,
        },

        cardTitle: {
            fontFamily: Fonts.poppins.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.s16,
            color: theme.black,
        },

        cardSubtitle: {
            fontFamily: Fonts.poppins.regular,
            fontWeight: TextStyles.regular.fontWeight,
            fontSize: FontSize.xxs12,
            color: theme.greyPrimaryMainText,
        },

        // badges for signed/unsigned status

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
            fontFamily: Fonts.poppins.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xxs12,
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
            fontFamily: Fonts.poppins.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xxs12,
            color: theme.redPrimary,
        },

        // view buttons

        viewButtonUnsigned: {
            backgroundColor: theme.redPrimary,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
        },

        viewButtonSigned: {
            backgroundColor: theme.greyPrimaryMainText,
            borderRadius: BorderRadius.largeButtonsAndOutlines,
        },

        buttonLabel: {
            fontFamily: Fonts.poppins.regular,
            fontWeight: TextStyles.semiBold.fontWeight,
            fontSize: FontSize.xs14,
            color: theme.white,
        },

        buttonContent: {
            paddingVertical: 4,
        },
    });
};