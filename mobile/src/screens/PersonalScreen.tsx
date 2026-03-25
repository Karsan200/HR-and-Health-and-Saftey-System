import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import AuthenticationService from '../logic/AuthenticationService';

type Qualification = {
    title: string;
    details: string;
    url: string;
};

export default function PersonalScreen() {

    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchQualifications();
    }, []);

    const fetchQualifications = async () => {
        try {

            const response = await AuthenticationService.fetch('/api/qualifications');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load qualifications.');
                return;
            }

            const data: Qualification[] = await response.json();
            setQualifications(data);

        } catch {
            Alert.alert('Error', 'Unexpected error.');
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
        return <ActivityIndicator testID="loading-indicator" />;
    }

    return (
        <FlatList
            data={qualifications}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
                <View>
                    <Text>{item.title}</Text>
                    <Text>{item.details}</Text>

                    <TouchableOpacity onPress={() => setSelectedUrl(item.url)}>
                        <Text>View</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}