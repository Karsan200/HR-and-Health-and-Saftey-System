import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AuthenticationService from '../logic/AuthenticationService.ts';

type HazardSummary = {
    hazardId: number;
    title: string;
    createdBy: string;
    isDraft: boolean;
    isClosed: boolean;
    created: string;
};

type Props = {
    riskAssessmentId: number;
    riskAssessmentTitle: string;
    onViewHazard: (hazardId: number) => void;
    onEditDraft: (hazardId: number) => void;
    onBack: () => void;
};

export default function HazardList({
                                       riskAssessmentId,
                                       riskAssessmentTitle,
                                       onViewHazard,
                                       onEditDraft,
                                       onBack,
                                   }: Props) {

    const [hazards, setHazards] = useState<HazardSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHazards = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthenticationService.fetch(
                `/api/risk-assessment/${riskAssessmentId}/hazards`
            );

            if (!response.ok) {
                setError('Failed to load hazard reports.');
                return;
            }

            const data = await response.json();
            setHazards(data);
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }, [riskAssessmentId]);

    useEffect(() => {
        fetchHazards();
    }, [fetchHazards]);

    function handlePress(hazard: HazardSummary) {
        if (hazard.isDraft) {
            onEditDraft(hazard.hazardId);
        } else {
            onViewHazard(hazard.hazardId);
        }
    }

    if (loading) return <ActivityIndicator />;

    if (error) {
        return (
            <View>
                <Text>{error}</Text>
                <TouchableOpacity onPress={fetchHazards}>
                    <Text>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View>
            <TouchableOpacity onPress={onBack}>
                <Text>Back</Text>
            </TouchableOpacity>

            <Text>{riskAssessmentTitle}</Text>

            <FlatList
                data={hazards}
                keyExtractor={(item) => item.hazardId.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePress(item)}>
                        <Text>{item.title}</Text>
                        <Text>{item.createdBy}</Text>
                        <Text>{item.created}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}