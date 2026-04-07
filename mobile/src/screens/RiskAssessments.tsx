import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AuthenticationService from '../logic/AuthenticationService.ts';
import RiskCard from '../components/RiskCard';

type RiskAssessmentSummary = {
    riskAssessmentId: number;
    title: string;
    hazardCount: number;
    created: string;
};

type Props = {
    onViewHazards: (riskAssessmentId: number, title: string) => void;
    onStartAssessment: () => void;
};

export default function RiskAssessment({ onViewHazards, onStartAssessment }: Props) {
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

    if (loading) return <ActivityIndicator />;

    if (error) {
        return (
            <View>
                <Text>{error}</Text>
                <TouchableOpacity onPress={fetchAssessments}>
                    <Text>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View>

            <TouchableOpacity onPress={onStartAssessment}>
                <Text>New</Text>
            </TouchableOpacity>

            <FlatList
                data={assessments}
                keyExtractor={(item) => item.riskAssessmentId.toString()}
                renderItem={({ item }) => (
                    <RiskCard
                        title={item.title}
                        subheading={`Hazards: ${item.hazardCount}`}
                        date={item.created}
                        // No status badge on the risk page
                        onPress={() => onViewHazards(item.riskAssessmentId, item.title)}
                    />
                )}
            />
        </View>
    );
}