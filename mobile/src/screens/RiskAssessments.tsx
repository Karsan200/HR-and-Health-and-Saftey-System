import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService.ts';
import RiskCard from '../components/RiskCard';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './RiskAssessments.styles';

type RiskAssessmentSummary = {
    riskAssessmentId: number;
    title: string;
    hazardCount: number;
    created: string;
    hasDrafts: boolean;
};

type Props = {
    onViewHazards: (riskAssessmentId: number, title: string) => void;
    onStartAssessment: () => void;
};

export default function RiskAssessment({ onViewHazards, onStartAssessment }: Props) {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = screenStyles(theme, accessibility);

    const [assessments, setAssessments] = useState<RiskAssessmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthenticationService.fetch('/api/risk-assessment/all');
            if (!response.ok) {
                setError('Failed to load risk assessments.');
                return;
            }
            const data = await response.json();
            setAssessments(data);
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.redPrimary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchAssessments}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <FlatList
                data={assessments}
                keyExtractor={(item) => item.riskAssessmentId.toString()}
                contentContainerStyle={styles.listContent}

                ListHeaderComponent={
                    <Button
                        mode="contained"
                        onPress={onStartAssessment}
                        style={styles.newAssessmentButton}
                        labelStyle={styles.newAssessmentButtonLabel}
                        contentStyle={styles.newAssessmentButtonContent}
                    >
                        Start New Assessment
                    </Button>
                }

                renderItem={({ item }) => (
                    <RiskCard
                        title={item.title}
                        subheading={`Hazards: ${item.hazardCount}`}
                        date={item.created}
                        isDraft={item.hasDrafts}
                        onPress={() => onViewHazards(item.riskAssessmentId, item.title)}
                    />
                )}
            />
        </View>
    );
}