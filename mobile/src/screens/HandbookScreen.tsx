import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import AuthenticationService from '../logic/AuthenticationService';

type Handbook = {
    documentId: number;
    title: string;
    url: string;
};

export default function HandbookScreen() {
    const [handbooks, setHandbooks] = useState<Handbook[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchHandbooks();
    }, []);

    const fetchHandbooks = async () => {
        try {
            const response = await AuthenticationService.fetch('/api/handbooks');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load handbooks.');
                return;
            }

            const data: Handbook[] = await response.json();
            setHandbooks(data);
        } catch {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (selectedUrl) {
        return (
            <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => setSelectedUrl(null)}>
                    <Text>Back</Text>
                </TouchableOpacity>
                <Pdf
                    source={{ uri: selectedUrl, cache: false }}
                    trustAllCerts={false}
                    style={{ flex: 1 }}
                    onError={(error) => {
                        console.error('PDF error:', error);
                        Alert.alert('Error', 'Failed to load PDF.');
                    }}
                />
            </View>
        );
    }

    if (loading) {
        return <ActivityIndicator />;
    }

    return (
        <FlatList
            data={handbooks}
            keyExtractor={(item) => item.documentId.toString()}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedUrl(item.url)}>
                    <Text>{item.title}</Text>
                </TouchableOpacity>
            )}
        />
    );
}