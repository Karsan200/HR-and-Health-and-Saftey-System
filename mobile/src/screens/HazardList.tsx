import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AuthenticationService from '../logic/AuthenticationService.ts';
import RiskCard from '../components/RiskCard';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './HazardList.styles';
import SummaryRow from "../components/summary/SummaryRow.tsx";
import SummaryCard from "../components/summary/SummaryCard.tsx";
import FilterPills from "../components/FilterPills.tsx";
import HazardForm from "./HazardForm.tsx";

// Summary data structure for a hazard report, used in the list view
type HazardSummary = {
    hazardId: number;
    title: string;
    createdBy: string;
    draft: boolean;
    closed: boolean;
    created: string;
    ownedByCurrentUser: boolean;
};

// Full data structure for a hazard report, used when editing a draft
type HazardReport = {
    hazardId: number;
    title: string;
    questionOne: string;
    questionTwo: string;
    questionThree: string;
    questionFour: string;
    questionFive: string;
    questionSix: string | null;
    isDraft: boolean;
    isClosed: boolean;
    createdBy: string;
    created: string;
    fileUrls: string[];
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

    // State for the list of hazards, loading status, and any error message
    const [hazards, setHazards] = useState<HazardSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for the current status filter (all, draft, submitted, closed)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // State for tracking which draft is currently being edited (if any)
    const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
    const [draftData, setDraftData] = useState<HazardReport | null>(null);

    // When the user taps on a draft hazard, we need to fetch its full details and show the edit form
    const handleEditDraft = async (hazardId: number) => {
        const response = await AuthenticationService.fetch(`/api/risk-assessment/hazard/${hazardId}`);
        const data = await response.json();
        setDraftData(data);
        setEditingDraftId(hazardId);
    };

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

    const draftCount = hazards.filter(h => h.draft && h.ownedByCurrentUser).length;
    const submittedCount = hazards.filter(h => !h.draft && !h.closed).length;
    const closedCount = hazards.filter(h => h.closed).length;

    const filters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'draft', label: 'Draft' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'closed', label: 'Closed' },
    ];

    const filteredHazards = hazards.filter(h => {
        if (statusFilter === 'all') return true;

        if (statusFilter === 'draft') return h.draft && h.ownedByCurrentUser;

        if (statusFilter === 'closed') return h.closed;

        if (statusFilter === 'submitted') return !h.draft && !h.closed;

        return true;
    });

    // If we're editing a draft, show the form instead of the list
    if (editingDraftId && draftData) {
        return (
            <HazardForm
                hazardId={editingDraftId}
                initialData={{
                    title: draftData.title,
                    questionOne: draftData.questionOne,
                    questionTwo: draftData.questionTwo,
                    questionThree: draftData.questionThree,
                    questionFour: draftData.questionFour,
                    questionFive: draftData.questionFive,
                    questionSix: draftData.questionSix,
                    isCompleted: draftData.isClosed,
                }}
                onDone={() => { setEditingDraftId(null); setDraftData(null); }}
            />
        );
    }

    return (
        <View style={styles.screen}>

            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.headerTitle} numberOfLines={2}>
                    {riskAssessmentTitle}
                </Text>
            </View>

            {/* Filter pills */}
            <FilterPills
                options={filters}
                selected={statusFilter}
                onSelect={setStatusFilter}
                style={styles.filterContainer}
            />

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
                        status={item.draft ? 'draft' : item.closed ? 'closed' : 'submitted'}
                        isDraft={item.draft}
                        viewLabel="View Hazard"
                        onPress={() =>
                            item.draft && item.ownedByCurrentUser
                                ? handleEditDraft(item.hazardId)
                                : onViewHazard(item.hazardId)
                        }
                    />
                )}
            />
        </View>
    );
}