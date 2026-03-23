import React, { useEffect, useState } from 'react';
import { View, Text, Alert, Switch, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import AuthenticationService from '../logic/AuthenticationService';

type Document = {
    documentId: number;
    title: string;
    url: string;
};

export default function DocumentsViewScreen() {

    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, []);

    const fetchDocument = async () => {
        try {
            const response = await AuthenticationService.fetch('/api/documents/1');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load document.');
                return;
            }

            const data = await response.json();
            setDocument(data);
        } catch {
            Alert.alert('Error', 'Unexpected error.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator />;

    if (!document) return <Text>Document not found</Text>;

    return (
        <View style={{ flex: 1 }}>

            <Text>{document.title}</Text>

            <Pdf
                source={{ uri: document.url, cache: false }}
                trustAllCerts={false}
                style={{ flex: 1 }}
            />

            <View>
                <Text>Acknowledge</Text>
                <Switch
                    value={checked}
                    onValueChange={setChecked}
                />
            </View>

        </View>
    );
}