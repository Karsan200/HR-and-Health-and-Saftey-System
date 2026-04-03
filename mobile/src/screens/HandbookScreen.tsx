import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
    PermissionsAndroid, Platform,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AuthenticationService from '../logic/AuthenticationService';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './HandbookScreen.styles';
import HrPdfCard from '../components/HrPdfCard.tsx';

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

    // Downloading logic
    const requestStoragePermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android' && Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const handleDownload = async (url: string, filename: string) => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to download files.');
            return;
        }

        // Sanitise filename
        const safeFilename = filename.replace(/[^a-zA-Z0-9 _-]/g, '').trim();

        const { dirs } = ReactNativeBlobUtil.fs;
        // This way works for the emulator
        const downloadDir = Platform.OS === 'android'
            ? '/storage/emulated/0/Download'
            : dirs.DocumentDir;

        // CHANGE TO THIS FOR PRODUCTION BUILD
        // const downloadDir = Platform.OS === 'android'
        //     ? ReactNativeBlobUtil.fs.dirs.DownloadDir ?? '/storage/emulated/0/Download'
        //     : ReactNativeBlobUtil.fs.dirs.DocumentDir;

        const filePath = `${downloadDir}/${safeFilename}.pdf`;

        try {
            const res = await ReactNativeBlobUtil.config({
                fileCache: true,
                path: filePath,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: safeFilename,
                    description: 'Downloading handbook...',
                    mime: 'application/pdf',
                    mediaScannable: true,
                    path: filePath,
                },
            }).fetch('GET', url);

            console.log('Saved to:', res.path());

            if (Platform.OS === 'ios') {
                await ReactNativeBlobUtil.ios.presentOptionsMenu(res.path());
            } else {
                Alert.alert('Downloaded', `${safeFilename} saved to Downloads.`);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to download the file.');
            console.error(err);
        }
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