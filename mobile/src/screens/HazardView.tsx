import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import AuthenticationService from '../logic/AuthenticationService.ts';

type HazardReport = {
    hazardId: number;
    title: string;
    questionOne: string;
    questionTwo: string;
    questionThree: string;
    questionFour: string;
    questionFive: string;
    questionSix: string;
    isDraft: boolean;
    isClosed: boolean;
    createdBy: string;
    created: string;
    fileUrls: string[];
};

type Props = {
    hazardId: number;
    onBack: () => void;
};

export default function HazardView({ hazardId, onBack }: Props) {

    const [hazard, setHazard] = useState<HazardReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHazard = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await AuthenticationService.fetch(
                `/api/risk-assessment/hazard/${hazardId}`
            );

            if (!response.ok) {
                setError('Failed to load hazard report.');
                return;
            }

            const data = await response.json();
            setHazard(data);
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }

    }, [hazardId]);

    useEffect(() => {
        fetchHazard();
    }, [fetchHazard]);

    if (loading) return <ActivityIndicator />;

    if (error || !hazard) {
        return (
            <View>
                <Text>{error ?? 'Hazard not found.'}</Text>
                <TouchableOpacity onPress={fetchHazard}>
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

            <ScrollView>
                <Text>{hazard.title}</Text>

                <Text>{hazard.createdBy}</Text>
                <Text>{hazard.created}</Text>

                <Text>{hazard.questionOne}</Text>
                <Text>{hazard.questionTwo}</Text>
                <Text>{hazard.questionThree}</Text>
                <Text>{hazard.questionFour}</Text>
                <Text>{hazard.questionFive}</Text>
                <Text>{hazard.questionSix}</Text>

                {hazard.fileUrls.map((url, i) => (
                    <Image key={i} source={{ uri: url }} />
                ))}
            </ScrollView>
        </View>
    );
}