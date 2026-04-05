import React, { useContext } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import Pdf from 'react-native-pdf';
import { ThemeContext } from '../theme/colourController';
import { styles as cardStyles } from './HrPdfCard.styles';

interface HrPdfCardProps {
    title: string;
    subtitle: string;
    isPSixty?: boolean;
    pdfUrl: string;
    isExpanded: boolean;
    onPress: () => void;
    onDownload?: () => void;
}

/**
 * Reusable HR PDF card component.
 * Displays a document icon, title, subtitle and a download action.
 * When isExpanded is true, renders a PDF viewer inline below the header row.
 */
const HrPdfCard: React.FC<HrPdfCardProps> = ({
                                                 title,
                                                 subtitle,
                                                 isPSixty = false,
                                                 pdfUrl,
                                                 isExpanded,
                                                 onPress,
                                                 onDownload,
                                             }) => {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = cardStyles(theme, accessibility);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && !isExpanded && styles.cardPressed,
            ]}
            onPress={onPress}
        >
            {/* Header row: icon + text + actions */}
            <View style={styles.headerRow}>
                <View style={styles.iconContainer}>
                    <Icon
                        source="file-document-outline"
                        size={24}
                        color={theme.greyPrimaryMainText}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                    </Text>
                    {isPSixty && (
                        <View style={styles.p60Badge}>
                            <Text style={styles.p60Text}>P60</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actions}>
                    <Pressable
                        testID="download-button"
                        style={({ pressed }) => [
                            styles.downloadButton,
                            pressed && styles.downloadPressed,
                        ]}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            onDownload?.();
                        }}
                        hitSlop={8}
                    >
                        <Icon
                            source="tray-arrow-down"
                            size={22}
                            color={theme.redPrimary}
                        />
                    </Pressable>
                </View>
            </View>

            {/* Inline PDF viewer — only mounted when card is expanded */}
            {isExpanded && (
                <View style={styles.pdfContainer}>
                    <Pdf
                        source={{ uri: pdfUrl, cache: true }}
                        trustAllCerts={false}
                        style={styles.pdf}
                        onError={(error) => {
                            console.error('PDF error:', error);
                        }}
                    />
                </View>
            )}
        </Pressable>
    );
};

export default HrPdfCard;