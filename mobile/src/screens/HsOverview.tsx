import React, { useEffect, useState, useContext } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {Icon} from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import SummaryRow from '../components/summary/SummaryRow';
import AlertBox from '../components/AlertBox';
import { styles as baseStyles, localStyles as baseLocalStyles } from './HsOverview.styles';
import { ThemeContext } from '../theme/colourController';
import AuthenticationService from "../logic/AuthenticationService";

// Props for the small summary component
interface HsStatProps {
    count: string | number;
    label: string;
    styles: ReturnType<typeof baseLocalStyles>; // pass in themed styles
}

interface Props {
    onOpenRiskAssessment: () => void;
}

// Small summary card showing a number and label
const HsStat: React.FC<HsStatProps> = ({ count, label, styles }) => (
    <View style={styles.card}>
        <View style={styles.content}>
            <Text style={styles.count}>{count}</Text>
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
                {label}
            </Text>
        </View>
    </View>
);

// Quick Actions card that displays the Risk Assessment tile
const RiskCard: React.FC<{
    styles: ReturnType<typeof baseLocalStyles>,
    screenStyles: ReturnType<typeof baseStyles>,
    colours: any,
    onPress: () => void
}> = ({ styles, screenStyles, colours, onPress }) => (
    <View style={screenStyles.riskWrapper}>
        <TouchableOpacity style={styles.riskCard} onPress={onPress}>
            <View style={styles.iconBox}>
                <Icon source="clipboard-alert-outline" size={28} color={colours.bluePrimary} />
            </View>
            <Text style={styles.riskLabel}>Risk Assessment</Text>
        </TouchableOpacity>
    </View>
);

// Response from backend
interface HsOverviewResponse {
    pendingDocs: number;
    signed: number;
    hazards: number;
}

// Main HsOverview screen component
export default function HsOverview({ onOpenRiskAssessment }: Props) {
    const { theme, accessibility } = useContext(ThemeContext); // get current theme

    const styles = baseStyles(theme, accessibility); // themed styles
    const localStyles = baseLocalStyles(theme, accessibility); // themed local styles

    const [pendingDocs, setPendingDocs] = useState<number>(0);
    const [signedDocs, setSignedDocs] = useState<number>(0);
    const [hazards, setHazards] = useState<number>(0);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await AuthenticationService.fetch('/api/hs-overview');
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
                    <Icon source="alert-circle-outline" size={30} color={theme.redTrafficPrimary} />
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
                    circleColor={theme.redTrafficPrimary}
                    labelColor={theme.redTrafficTextDark}
                    labelBackground={theme.redTrafficBackgroundLight}
                />
            </View>

            <View style={styles.alertWrapper}>
                <AlertBox
                    label="Report"
                    body="Hazard Report #HA-26-001 has been updated"
                    circleColor={theme.amberPrimary}
                    labelColor={theme.amberTextDark}
                    labelBackground={theme.amberBackgroundLight}
                />
            </View>

            <View style={styles.alertWrapper}>
                <AlertBox
                    label="SOP"
                    body="Filler text. dont know what to put here"
                    circleColor={theme.amberPrimary}
                    labelColor={theme.amberTextDark}
                    labelBackground={theme.amberBackgroundLight}
                />
            </View>

            {/* Quick Actions heading (same styling as header title) */}
            <View style={styles.riskHeadingWrapper}>
                <Text style={styles.sectionHeading}>Quick Actions</Text>
            </View>
            <RiskCard
                styles={localStyles}
                screenStyles={styles}
                colours={theme}
                onPress={onOpenRiskAssessment}
            />
            {/* Summary stat cards row */}
            <View style={styles.cardsWrapper}>
                <SummaryRow>
                    <HsStat count={pendingDocs} label="Pending Docs" styles={localStyles} />
                    <HsStat count={signedDocs} label="Signed" styles={localStyles} />
                    <HsStat count={hazards} label="Hazards" styles={localStyles} />
                </SummaryRow>
            </View>
        </ScrollView>
    );
}