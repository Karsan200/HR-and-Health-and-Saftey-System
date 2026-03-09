import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Platform } from 'react-native';
import { Icon } from 'react-native-paper';
import SummaryRow from '../components/summary/SummaryRow';
import AlertBox from '../components/AlertBox';
import { styles, localStyles } from './HsOverview.styles';
import { colours } from '../theme/colours';

// Props for the small summary component
interface HsStatProps {
    count: string | number;
    label: string;
}

// Small summary card showing a number and label
const HsStat: React.FC<HsStatProps> = ({ count, label }) => (
    <View style={localStyles.card}>
        <View style={localStyles.content}>
            <Text style={localStyles.count}>{count}</Text>
            <Text style={localStyles.label} numberOfLines={1} ellipsizeMode="tail">
                {label}
            </Text>
        </View>
    </View>
);

// Quick Actions card that displays the Risk Assessment tile
const RiskCard: React.FC = () => (
    <View style={styles.riskWrapper}>
        <View style={localStyles.riskCard}>
            <View style={localStyles.iconBox}>
                <Icon source="clipboard-alert-outline" size={28} color={colours.bluePrimary} />
            </View>
            <Text style={localStyles.riskLabel}>Risk Assessment</Text>
        </View>
    </View>
);

// Response from backend
interface HsOverviewResponse {
    pendingDocs: number;
    signed: number;
    hazards: number;
}

// Main HsOverview screen component
export default function HsOverview() {
    const [pendingDocs, setPendingDocs] = useState<number>(0);
    const [signedDocs, setSignedDocs] = useState<number>(0);
    const [hazards, setHazards] = useState<number>(0);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // Determine backend URL based on platform
                let backendUrl = 'http://localhost:8080/hs-overview';
                if (Platform.OS === 'android') {
                    backendUrl = 'http://10.0.2.2:8080/hs-overview';
                }

                const response = await fetch(backendUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data: HsOverviewResponse = await response.json();
                setPendingDocs(data.pendingDocs);
                setSignedDocs(data.signed);
                setHazards(data.hazards);

            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };

        fetchDashboard();
    }, []);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
            {/* Header row: icon + title + badge */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <Icon source="alert-circle-outline" size={30} color={colours.redPrimary} />
                    <Text style={styles.headerTitle}>Actions Required</Text>
                </View>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>3</Text>
                </View>
            </View>

            {/* Reusable alert component instances */}
            <View style={styles.alertWrapper}>
                <AlertBox
                    label="Document"
                    body="Fire and Safety Policy v2.0 requires a signature"
                    circleColor={colours.redPrimary}
                    labelColor={colours.redTextDark}
                    labelBackground={colours.redBackgroundLight}
                />
            </View>

            <View style={styles.alertWrapper}>
                <AlertBox
                    label="Report"
                    body="Hazard Report #HA-26-001 has been updated"
                    circleColor={colours.amberPrimary}
                    labelColor={colours.amberTextDark}
                    labelBackground={colours.amberBackgroundLight}
                />
            </View>

            <View style={styles.alertWrapper}>
                <AlertBox
                    label="SOP"
                    body="Filler text. dont know what to put here"
                    circleColor={colours.amberPrimary}
                    labelColor={colours.amberTextDark}
                    labelBackground={colours.amberBackgroundLight}
                />
            </View>

            {/* Quick Actions heading (same styling as header title) */}
            <View style={styles.riskHeadingWrapper}>
                <Text style={styles.sectionHeading}>Quick Actions</Text>
            </View>
            <RiskCard />

            {/* Summary stat cards row */}
            <View style={styles.cardsWrapper}>
                <SummaryRow>
                    <HsStat count={pendingDocs} label="Pending Docs" />
                    <HsStat count={signedDocs} label="Signed" />
                    <HsStat count={hazards} label="Hazards" />
                </SummaryRow>
            </View>
        </ScrollView>
    );
}