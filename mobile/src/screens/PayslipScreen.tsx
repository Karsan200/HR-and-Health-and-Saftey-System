import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import AuthenticationService from '../logic/AuthenticationService';

type Payslip = {
    name: string;
    year: number;
    month: number;
    isPSixty: boolean;
    url: string;
};

export default function PayslipScreen() {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const response = await AuthenticationService.fetch('/api/payslips');

            if (!response.ok) {
                Alert.alert('Error', 'Failed to load payslips.');
                return;
            }

            const data: Payslip[] = await response.json();
            setPayslips(data);
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
            data={payslips}
            keyExtractor={(item) => `${item.name}-${item.year}-${item.month}`}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedUrl(item.url)}>
                    <Text>{item.name}</Text>
                    <Text>{item.month}/{item.year}</Text>
                    {item.isPSixty && <Text>P60</Text>}
                </TouchableOpacity>
            )}
        />
    );
}