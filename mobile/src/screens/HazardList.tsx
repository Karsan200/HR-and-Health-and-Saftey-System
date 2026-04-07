import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AuthenticationService from '../logic/AuthenticationService.ts';
import RiskCard from '../components/RiskCard';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './HazardList.styles';
import SummaryRow from "../components/summary/SummaryRow.tsx";
import SummaryCard from "../components/summary/SummaryCard.tsx";

type HazardSummary = {
    hazardId: number;
    title: string;
    createdBy: string;
    isDraft: boolean;
    isClosed: boolean;
    created: string;
};

type StatusFilter = 'all' | 'draft' | 'submitted' | 'closed';

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
                                   }: Props) {

    const { theme, accessibility } = useContext(ThemeContext);
    const styles = screenStyles(theme, accessibility);

    const [hazards, setHazards] = useState<HazardSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
                <TouchableOpacity onPress={fetchHazards}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const draftCount = hazards.filter(h => h.isDraft).length;
    const submittedCount = hazards.filter(h => !h.isDraft && !h.isClosed).length;
    const closedCount = hazards.filter(h => h.isClosed).length;

    const filters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'draft', label: 'Draft' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'closed', label: 'Closed' },
    ];

    const filteredHazards = hazards.filter(h => {
        if (statusFilter === 'all') return true;

        if (statusFilter === 'draft') return h.isDraft;

        if (statusFilter === 'closed') return h.isClosed;

        if (statusFilter === 'submitted') return !h.isDraft && !h.isClosed;

        return true;
    });

    return (
        <View style={styles.screen}>

            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.headerTitle} numberOfLines={2}>
                    {riskAssessmentTitle}
                </Text>
            </View>

            {/* Filter pills */}
            <View style={styles.filterRow}>
                {filters.map(({ key, label }) => (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.filterPill,
                            statusFilter === key && styles.filterPillActive,
                        ]}
                        onPress={() => setStatusFilter(key)}
                    >
                        <Text
                            style={[
                                styles.filterPillText,
                                statusFilter === key && styles.filterPillTextActive,
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Counts */}
            <SummaryRow>
                <SummaryCard
                    label="Draft"
                    value={draftCount}
                    colour="amber"
                />

                <SummaryCard
                    label="Submitted"
                    value={submittedCount}
                    colour="neutral"
                />

                <SummaryCard
                    label="Closed"
                    value={closedCount}
                    colour="green"
                />
            </SummaryRow>

            {/* Hazard list */}
            <FlatList
                data={filteredHazards}
                keyExtractor={(item) => item.hazardId.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <RiskCard
                        title={item.title}
                        subheading={`Assessor: ${item.createdBy}`}
                        date={item.created}
                        status={item.isDraft ? 'draft' : item.isClosed ? 'closed' : 'submitted'}
                        isDraft={item.isDraft}
                        onPress={() =>
                            item.isDraft
                                ? onEditDraft(item.hazardId)
                                : onViewHazard(item.hazardId)
                        }
                    />
                )}
            />
        </View>
    );
}