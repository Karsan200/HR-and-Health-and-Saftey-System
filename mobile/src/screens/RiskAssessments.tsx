import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService.ts';
import RiskCard from '../components/RiskCard';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './RiskAssessments.styles';
import CategoryToggle from "../components/CategoryToggle.tsx";

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

    const [assessmentFilter, setAssessmentFilter] = useState<'assessments' | 'drafts'>('assessments');
    const [draftHazards, setDraftHazards] = useState<any[]>([]);

    // Helper to format a specific ISO date to "DD/MM/YYYY"
    const formatAssessmentDate = (isoString: string): string => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        return `Date: ${day}/${month}/${year}`;
    };

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
        if (assessmentFilter === 'assessments') {
            fetchAssessments();
        } else {
            fetchDrafts();
        }
    }, [assessmentFilter]);

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

    const fetchDrafts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await AuthenticationService.fetch(
                '/api/risk-assessment/hazards/drafts'
            );

            if (!response.ok) {
                setError('Failed to load drafts.');
                return;
            }

            const data = await response.json();
            setDraftHazards(data);

        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.screen}>

            <CategoryToggle
                options={[
                    { key: 'assessments', label: 'Risk Assessments' },
                    { key: 'drafts', label: 'Drafts' },
                ]}
                selected={assessmentFilter}
                compact
                onSelect={(value) =>
                    setAssessmentFilter(value as 'assessments' | 'drafts')
                }
            />

            <FlatList
                data={assessmentFilter === 'assessments' ? assessments : draftHazards}
                keyExtractor={(item) =>
                    assessmentFilter === 'assessments'
                        ? item.riskAssessmentId.toString()
                        : item.hazardId.toString()
                }
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

                renderItem={({ item }) =>
                    assessmentFilter === 'assessments' ? (
                        <RiskCard
                            title={item.title}
                            subheading={`Hazards: ${item.hazardCount}`}
                            date={formatAssessmentDate(item.created)}
                            isDraft={item.hasDrafts}
                            onPress={() => onViewHazards(item.riskAssessmentId, item.title)}
                        />
                    ) : (
                        <RiskCard
                            title={item.title}
                            subheading={`Assessor: ${item.createdBy}`}
                            date={formatAssessmentDate(item.created)}
                            status="draft"
                            isDraft
                            viewLabel="Edit Draft"
                            onPress={() => onViewHazards(item.hazardId, item.title)}
                        />
                    )
                }
            />
        </View>
    );
}