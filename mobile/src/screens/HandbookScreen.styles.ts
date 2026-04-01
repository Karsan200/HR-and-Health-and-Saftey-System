import { StyleSheet } from 'react-native';
import { Spacing } from '../theme/theme';

/**
 * Styles used by the HandbookScreen.
 */
export const styles = (theme: any) => {
    return StyleSheet.create({
        /**
         * Root container - fills the screen with the app background colour.
         */
        screen: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },

        /**
         * ScrollView itself - carries the background colour so there's no flash
         * of white when content is shorter than the screen height.
         */
        scrollView: {
            flex: 1,
            backgroundColor: theme.greyBackground,
        },

        /**
         * ScrollView content container.
         * flexGrow: 1 ensures content anchors to the top rather than floating
         * down when there are only a few items on screen.
         */
        container: {
            flexGrow: 1,
            paddingTop: 12,
            paddingBottom: 24,
        },

        /**
         * Wrapper around each HrPdfCard to apply consistent horizontal padding and gap.
         */
        cardWrapper: {
            paddingHorizontal: Spacing.mediumPadding,
            marginBottom: 10,
        },

        /**
         * Centred loading indicator container - fills the screen vertically.
         */
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.greyBackground,
        },
    });
};