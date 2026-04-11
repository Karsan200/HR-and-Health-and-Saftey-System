import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import AuthenticationService from '../logic/AuthenticationService';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './PayslipScreen.styles';
import HrPdfCard from '../components/HrPdfCard.tsx';
import { useDownload } from '../logic/DownloadLogic.ts';

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
    const { handleDownload } = useDownload();

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