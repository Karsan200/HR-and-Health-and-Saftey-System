import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AuthenticationService from '../logic/AuthenticationService';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './PayslipScreen.styles';
import HrPdfCard from '../components/HrPdfCard.tsx';

type Payslip = {
    name: string;
    year: number;
    month: number;
    isPSixty: boolean;
    url: string;
};

/**
 * Returns the last day of the given month as a "Pay Date: DD/MM/YYYY" string.
 */
const formatPayDate = (year: number, month: number): string => {
    const lastDay = new Date(year, month, 0).getDate();
    const mm = String(month).padStart(2, '0');
    return `Pay Date: ${lastDay}/${mm}/${year}`;
};

/**
 * Returns a human-readable month + year title e.g. "January 2026".
 */
const formatPayslipTitle = (year: number, month: number): string => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

/**
 * Returns the standard UK P60 tax year title e.g. "P60 – Tax Year 2024/25".
 * The UK tax year ends in April, so a P60 issued in April 2025
 * covers the 2024/25 tax year.
 */
const formatP60Title = (year: number, month: number): string => {
    const taxYearEnd = month >= 4 ? year : year - 1;
    const taxYearStart = taxYearEnd - 1;
    const shortEnd = String(taxYearEnd).slice(-2);
    return `P60 – Tax Year ${taxYearStart}/${shortEnd}`;
};

/**
 * Returns the subtitle for a P60 card e.g. "Tax Year 2024/25".
 */
const formatP60Subtitle = (year: number, month: number): string => {
    const taxYearEnd = month >= 4 ? year : year - 1;
    const taxYearStart = taxYearEnd - 1;
    const shortEnd = String(taxYearEnd).slice(-2);
    return `Tax Year ${taxYearStart}/${shortEnd}`;
};

export default function PayslipScreen() {
    const { theme} = useContext(ThemeContext);
    const styles = screenStyles(theme);

    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Tracks which card is currently expanded
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const response = await AuthenticationService.fetch('/api/payslips');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load payslips.');
                return;
            }

            const data: Payslip[] = await response.json();
            setPayslips(data);
        } catch {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCardPress = (key: string) => {
        // Tapping an open card collapses it; tapping a closed card expands it
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

        //CHANGE TO THIS FOR PRODUCTION BUILD
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
                    description: 'Downloading payslip...',
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

    // List of Payslips
    return (
        <View style={styles.screen}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
                {payslips.map((item) => {
                    const key = `${item.name}-${item.year}-${item.month}`;
                    const filename = item.isPSixty
                        ? formatP60Title(item.year, item.month)
                        : formatPayslipTitle(item.year, item.month);
                    return (
                        <View key={key} style={styles.cardWrapper}>
                            <HrPdfCard
                                title={item.isPSixty ? formatP60Title(item.year, item.month) : formatPayslipTitle(item.year, item.month)}
                                subtitle={item.isPSixty ? formatP60Subtitle(item.year, item.month) : formatPayDate(item.year, item.month)}
                                isPSixty={item.isPSixty}
                                pdfUrl={item.url}
                                isExpanded={expandedKey === key}
                                onPress={() => handleCardPress(key)}
                                onDownload={() => handleDownload(item.url, filename)}                                    // Wire up a share/download action here when ready
                            />
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}