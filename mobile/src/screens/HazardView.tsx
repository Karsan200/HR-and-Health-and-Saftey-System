import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

import { Checkbox } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService.ts';
import { ThemeContext } from '../theme/colourController.tsx';
import { styles as viewStyles } from './HazardView.styles.ts';

type HazardReport = {
    hazardId: number;
    title: string;
    questionOne: string;
    questionTwo: string;
    questionThree: string;
    questionFour: string;
    questionFive: string;
    questionSix: string;
    draft: boolean;
    closed: boolean;
    createdBy: string;
    created: string;
    fileUrls: string[];
};

type Props = {
    hazardId: number;
    onBack: () => void;
};

// Renders a single read-only labelled field box, matching the outlined TextInput look
function ReadOnlyField({ label, value, styles }: { label: string; value: string; styles: any }) {
    return (
        <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldBox}>
                <Text style={styles.fieldValue}>{value || '—'}</Text>
            </View>
        </View>
    );
}

export default function HazardView({ hazardId, onBack }: Props) {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = viewStyles(theme, accessibility);

    const [hazard, setHazard] = useState<HazardReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Local checkbox state — only interactive for submitted
    const [actionCompleted, setActionCompleted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

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
            // closed is true when actionComplete has a timestamp on the backend
            const completed = !!data.closed;
            setIsCompleted(completed);
            setActionCompleted(completed);
        } catch {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }, [hazardId]);

    useEffect(() => {
        fetchHazard();
    }, [fetchHazard]);

    // Format ISO string → DD/MM/YYYY
    const formatDate = (iso: string): string => {
        if (!iso) return '—';
        const d = new Date(iso);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={theme.redPrimary} />
            </View>
        );
    }

    if (error || !hazard) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{error ?? 'Hazard not found.'}</Text>
                <TouchableOpacity onPress={fetchHazard} style={styles.retryButton}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Calls the backend to stamp actionComplete with the current timestamp.
    const handleCompleteAction = async () => {
        if (!hazard) return;
        try {
            const response = await AuthenticationService.fetch(
                `/api/risk-assessment/hazard/${hazard.hazardId}/complete`,
                { method: 'PATCH' }
            );
            if (!response.ok) {
                console.error('Failed to complete hazard action:', response.status);
                return;
            }
            // Lock the checkbox — from this point it behaves like a closed hazard
            setActionCompleted(true);
            setIsCompleted(true);
        } catch (error) {
            console.error('Error completing hazard action:', error);
        }
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.spacer} />

            {/* Assessment Information Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Assessment Information</Text>
                <ReadOnlyField label="Assessment Title" value={hazard.title} styles={styles} />
            </View>

            {/* Hazard Detail Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Hazard</Text>

                <ReadOnlyField
                    label="What are the hazards?"
                    value={hazard.questionOne}
                    styles={styles}
                />
                <ReadOnlyField
                    label="Who might be harmed and how?"
                    value={hazard.questionTwo}
                    styles={styles}
                />
                <ReadOnlyField
                    label="What are you doing to control the risk?"
                    value={hazard.questionThree}
                    styles={styles}
                />
                <ReadOnlyField
                    label="What further actions do you need to take to control the risk?"
                    value={hazard.questionFour}
                    styles={styles}
                />
                <ReadOnlyField
                    label="Who needs to carry out the action?"
                    value={hazard.questionFive}
                    styles={styles}
                />
                <ReadOnlyField
                    label="When is the action needed by?"
                    value={formatDate(hazard.questionSix)}
                    styles={styles}
                />

                {/* Checkbox behaviour: greyed out if closed, interactive when submitted */}
                <View style={styles.checkboxRow}>
                    <TouchableOpacity
                        onPress={!isCompleted ? handleCompleteAction : undefined}
                        activeOpacity={!isCompleted ? 0.7 : 1}
                    >
                        <Checkbox
                            status={actionCompleted ? 'checked' : 'unchecked'}
                            color={!isCompleted ? theme.redPrimary : theme.greyIconLight}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.checkboxLabel, isCompleted && styles.checkboxLabelDisabled]}>
                        Action completed
                    </Text>
                </View>
            </View>

            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
}