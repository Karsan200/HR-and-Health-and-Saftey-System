import { StyleSheet } from 'react-native';
import { Spacing, FontSize, TextStyles, BorderRadius } from '../theme/theme';
import { Colours } from '../theme/colours';

/**
 * Styles used by the HsOverview screen components.
 */
export const styles = StyleSheet.create({
    /**
     * Root container for the screen background and full height.
     * Applies the app background colour and flex expansion.
     */
    screen: {
        flex: 1,
        backgroundColor: Colours.greyBackground,
    },

    /**
     * Content container used as the ScrollView content style.
     * Provides vertical padding above and below the scrollable area.
     */
    container: {
        paddingTop: 24,
        paddingBottom: 24,
    },

    /**
     *  Header row styles
     * Arranges the icon, title and badge horizontally and spaces them.
     */
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.mediumPadding,
        marginBottom: 12,
        paddingTop: 20,
    },

    /**
     * Left side of the header: holds icon + title horizontally.
     * Uses center alignment to vertically align the icon and text.
     */
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    /**
     * Header title text style.
     * Uses the medium text family and large font size.
     */
    headerTitle: {
        marginLeft: 8,
        ...TextStyles.medium,
        fontSize: FontSize.l24,
        color: Colours.black,
    },

    /**
     * Notification badge container in the header.
     * Fixed height/minWidth and centred content for the numeric badge.
     */
    headerBadge: {
        backgroundColor: Colours.redPrimary,
        borderRadius: BorderRadius.mediumNotification,
        paddingHorizontal: 8,
        height: 28,
        minWidth: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /**
     * Notification badge text.
     * Uses semiBold font and lineHeight matched to badge height for vertical centering.
     */
    headerBadgeText: {
        color: Colours.white,
        ...TextStyles.semiBold,
        fontSize: FontSize.s16,
        lineHeight: 28,
    },

    /**
     * Quick Actions heading wrapper.
     * Aligns horizontally with the risk card content padding.
     */
    riskHeadingWrapper: {
        paddingHorizontal: Spacing.largePadding,
        marginBottom: 8,
    },

    /**
     * Section heading style used for "Actions Required" and "Quick Actions".
     * Matches the header title typography.
     */
    sectionHeading: {
        ...TextStyles.medium,
        fontSize: FontSize.l24,
        color: Colours.black,
    },

    /**
     * Generic title style used elsewhere on the screen.
     */
    title: {
        fontSize: 20,
        color: Colours.blueDark,
        marginBottom: 12,
        paddingHorizontal: Spacing.mediumPadding,
    },

    /**
     * Wrapper for each AlertBox instance to apply horizontal padding.
     */
    alertWrapper: {
        paddingHorizontal: Spacing.largePadding,
        marginBottom: 12,
    },

    /**
     * Wrapper around the risk card to keep consistent horizontal spacing.
     */
    riskWrapper: {
        paddingHorizontal: Spacing.largePadding,
        marginBottom: 12,
    },

    /**
     * Wrapper for the summary cards row.
     * Provides a small top gap separate from other sections.
     */
    cardsWrapper: {
        marginTop: 8,
    },
});

/**
 * Local styles used by small, reusable components inside this screen.
 * Kept separate from `styles` to indicate scoped usage (cards, labels, icons).
 */
export const localStyles = StyleSheet.create({
    /**
     * Generic card container used for summary tiles.
     * Applies background, border radius and elevation for a raised look.
     */
    card: {
        flex: 1,
        backgroundColor: Colours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        paddingVertical: 8,
        paddingHorizontal: 6,
        shadowColor: Colours.greyIconLight,
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    },

    /**
     * Inner content container for cards.
     * Centers children and applies vertical gap between elements.
     */
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    /**
     * Numeric count style for summary tiles.
     * Uses medium font family and medium-large font size.
     */
    count: {
        ...TextStyles.medium,
        fontSize: FontSize.m20,
        color: Colours.black,
    },

    /**
     * Label text style displayed below the count in summary tiles.
     * Uses smaller font size and grey tone for secondary emphasis.
     */
    label: {
        ...TextStyles.medium,
        fontSize: FontSize.xs14,
        color: Colours.greyPrimaryMainText,
        textAlign: 'center',
    },

    /**
     * Risk assessment card style.
     * Fixed height requested by design, with centred content and elevation.
     */
    riskCard: {
        height: 111,
        backgroundColor: Colours.white,
        borderRadius: BorderRadius.largeButtonsAndOutlines,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colours.greyIconLight,
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4,
    },

    /**
     * Small square behind the risk icon.
     * Fixed size with rounded corners and light blue background.
     */
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 6,
        backgroundColor: Colours.blueLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },

    /**
     * Label underneath the risk icon inside the risk card.
     * Uses medium weight and small font size for compact appearance.
     */
    riskLabel: {
        ...TextStyles.medium,
        fontSize: FontSize.s16,
        color: Colours.black,
        textAlign: 'center',
    },
});
