import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { ThemeContext } from '../theme/colourController';
import { styles as cardStyles } from './RiskCard.styles';
import EyeButton from "./EyeButton.tsx";

type StatusBadge = 'draft' | 'submitted' | 'closed';

interface RiskCardProps {
    /** Main heading — e.g. assessment title or hazard title */
    title: string;
    /** Sub-heading — e.g. "Hazards: 5" on risk page, "Assessor: Name" on hazard page */
    subheading: string;
    /** Formatted date string — e.g. "28 Jan, 2026" */
    date: string;
    /** When provided, renders a coloured status pill above the title */
    status?: StatusBadge;
    /** Whether the item is still being edited (shows red "Continue Editing" button) */
    isDraft?: boolean;
    /** Called when the action button is pressed */
    onPress: () => void;
    viewLabel?: string;
}

/**
 * Shared card used on both the Risk Assessment list and the Hazard list.
 *
 * Risk page:   no status badge, subheading = hazard count
 * Hazard page: status badge shown,  subheading = assessor name
 */
const RiskCard: React.FC<RiskCardProps> = ({
                                                           title,
                                                           subheading,
                                                           date,
                                                           status,
                                                           isDraft = false,
                                                           onPress,
                                               viewLabel = 'View Assessment',
                                                       }) => {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = cardStyles(theme, accessibility);

    const badgeStyle = status
        ? {
            draft: styles.badgeDraft,
            submitted: styles.badgeSubmitted,
            closed: styles.badgeClosed,
        }[status]
        : null;

    const badgeTextStyle = status
        ? {
            draft: styles.badgeTextDraft,
            submitted: styles.badgeTextSubmitted,
            closed: styles.badgeTextClosed,
        }[status]
        : null;

    const badgeLabel = status
        ? { draft: 'Draft', submitted: 'Submitted', closed: 'Closed' }[status]
        : null;

    return (
        <View style={styles.card}>
            {/* Optional status badge */}
            {status && badgeStyle && badgeTextStyle && (
                <View style={[styles.badge, badgeStyle]}>
                    <Text style={[styles.badgeText, badgeTextStyle]}>{badgeLabel}</Text>
                </View>
            )}

            {/* Text block */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subheading}>{subheading}</Text>
            <Text style={styles.date}>{date}</Text>

            {/* Action button */}
            <EyeButton
                label={isDraft ? 'Continue Editing' : viewLabel}
                active={isDraft}
                onPress={onPress}
            />
        </View>
    );
};

export default RiskCard;