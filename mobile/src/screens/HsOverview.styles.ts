import { StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { colours } from '../theme/colours';

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
        backgroundColor: colours.greyBackground,
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
        paddingHorizontal: theme.spacing.mediumPadding,
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
        ...theme.textStyles.medium,
        fontSize: theme.fontSize.l24,
        color: colours.black,
    },

    /**
     * Notification badge container in the header.
     * Fixed height/minWidth and centred content for the numeric badge.
     */
    headerBadge: {
        backgroundColor: colours.redPrimary,
        borderRadius: theme.borderRadius.mediumNotification,
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
        color: colours.white,
        ...theme.textStyles.semiBold,
        fontSize: theme.fontSize.s16,
        lineHeight: 28,
    },

    /**
     * Quick Actions heading wrapper.
     * Aligns horizontally with the risk card content padding.
     */
    riskHeadingWrapper: {
        paddingHorizontal: theme.spacing.largePadding,
        marginBottom: 8,
    },

    /**
     * Section heading style used for "Actions Required" and "Quick Actions".
     * Matches the header title typography.
     */
    sectionHeading: {
        ...theme.textStyles.medium,
        fontSize: theme.fontSize.l24,
        color: colours.black,
    },

    /**
     * Generic title style used elsewhere on the screen.
     */
    title: {
        fontSize: 20,
        color: colours.blueDark,
        marginBottom: 12,
        paddingHorizontal: theme.spacing.mediumPadding,
    },

    /**
     * Wrapper for each AlertBox instance to apply horizontal padding.
     */
    alertWrapper: {
        paddingHorizontal: theme.spacing.largePadding,
        marginBottom: 12,
    },

    /**
     * Wrapper around the risk card to keep consistent horizontal spacing.
     */
    riskWrapper: {
        paddingHorizontal: theme.spacing.largePadding,
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
        backgroundColor: colours.white,
        borderRadius: theme.borderRadius.largeButtonsAndOutlines,
        paddingVertical: 8,
        paddingHorizontal: 6,
        shadowColor: colours.greyIconLight,
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
        ...theme.textStyles.medium,
        fontSize: theme.fontSize.m20,
        color: colours.black,
    },

    /**
     * Label text style displayed below the count in summary tiles.
     * Uses smaller font size and grey tone for secondary emphasis.
     */
    label: {
        ...theme.textStyles.medium,
        fontSize: theme.fontSize.xs14,
        color: colours.greyPrimaryMainText,
        textAlign: 'center',
    },

    /**
     * Risk assessment card style.
     * Fixed height requested by design, with centred content and elevation.
     */
    riskCard: {
        height: 111,
        backgroundColor: colours.white,
        borderRadius: theme.borderRadius.largeButtonsAndOutlines,
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colours.greyIconLight,
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
        backgroundColor: colours.blueLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },

    /**
     * Label underneath the risk icon inside the risk card.
     * Uses medium weight and small font size for compact appearance.
     */
    riskLabel: {
        ...theme.textStyles.medium,
        fontSize: theme.fontSize.s16,
        color: colours.black,
        textAlign: 'center',
    },
});
