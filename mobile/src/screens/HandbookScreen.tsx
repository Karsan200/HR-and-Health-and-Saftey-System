import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AuthenticationService from '../logic/AuthenticationService';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './HandbookScreen.styles';
import HrPdfCard from '../components/HrPdfCard.tsx';
import { useDownload } from '../logic/DownloadLogic.ts';

type Handbook = {
    documentId: number;
    title: string;
    lastUpdated: string;
    url: string;
};

/**
 * Returns a subtitle string e.g. "Last Updated: 06/01/2026".
 */
const formatLastUpdated = (lastUpdated: string): string => {
    return `Last Updated: ${lastUpdated}`;
};

export default function HandbookScreen() {
    const { theme } = useContext(ThemeContext);
    const styles = screenStyles(theme);

    const [handbooks, setHandbooks] = useState<Handbook[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { handleDownload } = useDownload();

    // Tracks which card is currently expanded
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchHandbooks();
    }, []);

    const fetchHandbooks = async () => {
        try {
            const response = await AuthenticationService.fetch('/api/handbooks');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load handbooks.');
                return;
            }

            const data: Handbook[] = await response.json();
            setHandbooks(data);
        } catch {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCardPress = (key: string) => {
        setExpandedKey(prev => (prev === key ? null : key));
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    testID="loading-indicator"
                    size="large"
                    color={theme.redPrimary}
                />
            </View>
        );
    }

    // List of Handbooks
    return (
        <View style={styles.screen}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
                {handbooks.map((item) => {
                    const key = item.documentId.toString();
                    return (
                        <View key={key} style={styles.cardWrapper}>
                            <HrPdfCard
                                title={item.title}
                                subtitle={formatLastUpdated(item.lastUpdated)}
                                pdfUrl={item.url}
                                isExpanded={expandedKey === key}
                                onPress={() => handleCardPress(key)}
                                onDownload={() => handleDownload(item.url, item.title)}
                            />
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}