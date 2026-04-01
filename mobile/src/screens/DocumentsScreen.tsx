import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Button, Checkbox, Icon } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './DocumentsScreen.styles';

type Document = {
    documentId: number;
    title: string;
    url: string;
    signed: boolean;
};

type CategoryFilter = 'policies' | 'sop';
type StatusFilter = 'all' | 'awaiting' | 'signed';


// Strips the "SOP: " prefix from a title for display purposes. and the version suffix e.g. "v2.5"
const getDisplayTitle = (title: string): string => {
    return title
        .replace(/^SOP:\s*/i, '')
        .replace(/\sv\d+(\.\d+)?$/i, '')
        .trim();
};

// Extracts a version string from the end of a title e.g. "v2.5" → "2.5". returns "1.0" if no version found.
const getVersion = (title: string): string => {
    const match = title.match(/\sv(\d+(\.\d+)?)$/i);
    return match ? match[1] : '1.0';
};

export default function DocumentsScreen() {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = screenStyles(theme, accessibility);

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [checked, setChecked] = useState(false);

    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('policies');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await AuthenticationService.fetch('/api/documents');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load documents.');
                return;
            }

            const data: Document[] = await response.json();
            setDocuments(data);
        } catch {
            Alert.alert('Error', 'Unexpected error.');
        } finally {
            setLoading(false);
        }
    };

    const signDocument = async (document: Document) => {
        try {
            const response = await AuthenticationService.fetch(
                `/api/documents/${document.documentId}/sign`,
                { method: 'POST' }
            );

            if (!response.ok) {
                Alert.alert('Error', 'Failed to sign document.');
            }
        } catch {
            Alert.alert('Error', 'Unexpected error.');
        }
    };

    const handleCheckboxPress = async () => {
        if (!selectedDocument) return;

        const newValue = !checked;
        setChecked(newValue);

        if (newValue) {
            await signDocument(selectedDocument);

            setDocuments(prev =>
                prev.map(doc =>
                    doc.documentId === selectedDocument.documentId
                        ? { ...doc, signed: true }
                        : doc
                )
            );

            setSelectedDocument(prev =>
                prev ? { ...prev, signed: true } : prev
            );
        }
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator
                    testID="loading-indicator"
                    size="large"
                    color={theme.redPrimary}
                />
            </View>
        );
    }

    // PDF viewer
    if (selectedDocument) {
        return (
            <View style={styles.pdfScreen}>

                {/* Back header */}
                <View style={styles.pdfHeader}>
                    <TouchableOpacity
                        testID="pdf-back-button"
                        style={styles.backButton}
                        onPress={() => setSelectedDocument(null)}
                    >
                        <Icon source="arrow-left" size={24} color={theme.black} />
                    </TouchableOpacity>
                    <Text style={styles.pdfHeaderTitle} numberOfLines={1}>
                        {getDisplayTitle(selectedDocument.title)}
                    </Text>
                </View>

                {/* PDF Viewer */}
                <View style={styles.pdfContainer}>
                    <Pdf
                        source={{ uri: selectedDocument.url, cache: false }}
                        trustAllCerts={false}
                        style={styles.pdf}
                        onError={(error) => {
                            console.error('PDF error:', error);
                            Alert.alert('Error', 'Failed to load PDF.');
                        }}
                    />
                </View>

                {/* Acknowledgement Row */}
                <View style={styles.acknowledgeContainer}>
                    <Checkbox
                        testID="documentAcknowledgedCheckbox"
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={handleCheckboxPress}
                        color={theme.redPrimary}
                    />
                    <Text style={styles.acknowledgeText}>I acknowledge this document</Text>
                </View>

            </View>
        );
    }

    // Logic for filtering
    const filteredDocuments = documents.filter(doc => {
        const title = doc.title.toLowerCase();

        // Category filter
        const matchesCategory = categoryFilter === 'sop'
            ? title.includes('sop')
            : !title.includes('sop') && !title.includes('handbook');

        // Status filter
        const matchesStatus =
            statusFilter === 'all' ? true :
                statusFilter === 'awaiting' ? !doc.signed :
                    doc.signed;

        return matchesCategory && matchesStatus;
    });

    // List of Documents
    return (
        <View style={styles.screen}>

            {/* Category Toggle */}
            <View style={styles.categoryToggleContainer}>
                <View style={[
                    styles.categoryButtonWrapper,
                    categoryFilter === 'policies' && styles.categoryButtonWrapperActive,
                ]}>
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => setCategoryFilter('policies')}
                    >
                        <Text style={[
                            styles.categoryButtonText,
                            categoryFilter === 'policies' && styles.categoryButtonTextActive,
                        ]}>
                            {'Health and Safety\nPolicies'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[
                    styles.categoryButtonWrapper,
                    categoryFilter === 'sop' && styles.categoryButtonWrapperActive,
                ]}>
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => setCategoryFilter('sop')}
                    >
                        <Text style={[
                            styles.categoryButtonText,
                            categoryFilter === 'sop' && styles.categoryButtonTextActive,
                        ]}>
                            {'SOPs/\nInstructions'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Filter Pills */}
            <View style={styles.statusFilterContainer}>
                {(['all', 'awaiting', 'signed'] as StatusFilter[]).map((s) => {
                    const label = s === 'all' ? 'All' : s === 'awaiting' ? 'Awaiting Signature' : 'Signed';
                    return (
                        <TouchableOpacity
                            key={s}
                            style={[
                                styles.statusPill,
                                statusFilter === s && styles.statusPillActive,
                            ]}
                            onPress={() => setStatusFilter(s)}
                        >
                            <Text style={[
                                styles.statusPillText,
                                statusFilter === s && styles.statusPillTextActive,
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Document List */}
            <FlatList
                data={filteredDocuments}
                keyExtractor={(item) => item.documentId.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.card}>

                        {/* Card Header Row */}
                        <View style={styles.cardHeader}>
                            <View style={[
                                styles.iconContainer,
                                item.signed ? styles.iconContainerSigned : styles.iconContainerUnsigned,
                            ]}>
                                <Icon
                                    source="file-document-outline"
                                    size={22}
                                    color={item.signed ? theme.greenPrimary : theme.redPrimary}
                                />
                            </View>

                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {getDisplayTitle(item.title)}
                                </Text>
                                <Text style={styles.cardSubtitle} numberOfLines={1}>
                                    {item.title.toLowerCase().includes('sop') ? 'SOP' : 'Safety'} • Version {getVersion(item.title)}
                                </Text>

                                {item.signed ? (
                                    <View style={styles.signedBadge}>
                                        <Icon source="check" size={12} color={theme.greenPrimary} />
                                        <Text style={styles.signedBadgeText}>Signed</Text>
                                    </View>
                                ) : (
                                    <View style={styles.unsignedBadge}>
                                        <Icon source="clock-outline" size={12} color={theme.redPrimary} />
                                        <Text style={styles.unsignedBadgeText}>NEW • Signature Required</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Action Button */}
                        <Button
                            mode="contained"
                            icon="eye"
                            onPress={() => {
                                setSelectedDocument(item);
                                setChecked(item.signed);
                            }}
                            style={item.signed ? styles.viewButtonSigned : styles.viewButtonUnsigned}
                            labelStyle={styles.buttonLabel}
                            contentStyle={styles.buttonContent}
                        >
                            {item.signed ? 'View' : 'Review & Sign'}
                        </Button>
                    </View>
                )}
            />
        </View>
    );
}