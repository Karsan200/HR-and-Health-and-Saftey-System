import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { Checkbox } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService';

type Document = {
    documentId: number;
    title: string;
    url: string;
    signed: boolean;
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
            const data: Document = await response.json();
            setDocument(data);
            setChecked(data.signed);
        } catch {
            Alert.alert('Error', 'Unexpected error.');
        } finally {
            setLoading(false);
        }
    };

    const signDocument = async () => {

        if (!document) return;

        try {

            const response = await AuthenticationService.fetch(
                `/api/documents/${document.documentId}/sign`,
                { method: 'POST' }
            );

            if (!response.ok) {
                Alert.alert('Error', 'Failed to sign document.');
                return;
            }

        } catch {
            Alert.alert('Error', 'Unexpected error.');
        }
    };

    const handleCheckboxPress = async () => {

        const newValue = !checked;

        setChecked(newValue);

        if (newValue) {
            await signDocument();
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