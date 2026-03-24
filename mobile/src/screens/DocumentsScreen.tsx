import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import { Checkbox } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService';

type Document = {
    documentId: number;
    title: string;
    url: string;
    signed: boolean;
};

export default function DocumentsScreen() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [checked, setChecked] = useState(false);

    const [filter, setFilter] = useState<'policies' | 'sop'>('policies');

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

    if (loading) return <ActivityIndicator />;

    // When viewing a document
    if (selectedDocument) {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => setSelectedDocument(null)}>
                    <Text>Back</Text>
                </TouchableOpacity>

                <Text>{selectedDocument.title}</Text>

                <Pdf
                    source={{ uri: selectedDocument.url, cache: false }}
                    trustAllCerts={false}
                    style={{ flex: 1, width: Dimensions.get('window').width }}
                />

                <View>
                    <Checkbox
                        testID={"documentAcknowledgedCheckbox"}
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={handleCheckboxPress}
                    />
                    <Text>I acknowledge this document</Text>
                </View>
            </View>
        );
    }

    // Filtering logic
    const filteredDocuments = documents.filter(doc => {
        const title = doc.title.toLowerCase();

        if (filter === 'sop') {
            return title.includes('sop');
        }

        return !title.includes('sop') && !title.includes('handbook');
    });

    return (
        <View>

            {/* Filter Buttons */}
            <TouchableOpacity onPress={() => setFilter('policies')}>
                <Text>Health and Safety Policies</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFilter('sop')}>
                <Text>SOPs and Instructions</Text>
            </TouchableOpacity>

            {/* Document List */}
            <FlatList
                data={filteredDocuments}
                keyExtractor={(item) => item.documentId.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                        setSelectedDocument(item);
                        setChecked(item.signed);
                    }}>
                        <Text>{item.title}</Text>
                        <Text>View</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}