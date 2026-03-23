import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AuthenticationService from '../logic/AuthenticationService';

type Document = {
    documentId: number;
    title: string;
    url: string;
};

type Props = {
    onOpenDocument: () => void;
};

export default function DocumentsScreen({ onOpenDocument }: Props) {

    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);

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
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const openDocument = (id: number) => {
        setSelectedId(id);
        onOpenDocument();
    };

    if (loading) {
        return <ActivityIndicator />;
    }

    return (
        <FlatList
            data={documents}
            keyExtractor={(item) => item.documentId.toString()}
            renderItem={({ item }) => (
                <View>
                    <Text>{item.title}</Text>

                    <TouchableOpacity onPress={() => openDocument(item.documentId)}>
                        <Text>View</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}