import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { Button, Icon } from 'react-native-paper';
import AuthenticationService from '../logic/AuthenticationService';
import { ThemeContext } from '../theme/colourController';
import { styles as screenStyles } from './PersonalScreen.styles';

// Types

type PdfItem = {
    title: string;
    url: string;
};

type Qualification = PdfItem & {
    details: string;
};

type DrivingLicence = PdfItem & {
    extension: string;
};

type CategoryTab = 'qualifications' | 'drivingLicense';

export default function PersonalScreen() {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = screenStyles(theme, accessibility);

    // Qualifications
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQualification, setSelectedQualification] = useState<PdfItem | null>(null);

    // Driving licence
    const [drivingLicence, setDrivingLicence] = useState<DrivingLicence | null>(null);
    const [licenceLoading, setLicenceLoading] = useState(false);
    const [licenceError, setLicenceError] = useState(false);
    const [selectedLicence, setSelectedLicence] = useState<DrivingLicence | null>(null);

    // Navigation
    const [activeTab, setActiveTab] = useState<CategoryTab>('qualifications');

    useEffect(() => {
        fetchQualifications();
    }, []);

    // Fetch Functions

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

    const fetchDrivingLicence = async () => {
        setLicenceLoading(true);
        setLicenceError(false);
        try {
            const response = await AuthenticationService.fetch('/api/driving-licence');

            if (response.status === 404) {
                setDrivingLicence(null);
                return;
            }
            if (!response.ok) {
                setLicenceError(true);
                return;
            }

            const data: DrivingLicence = await response.json();
            setDrivingLicence(data);
        } catch {
            setLicenceError(true);
        } finally {
            setLicenceLoading(false);
        }
    };

    const handleDrivingLicenceTabPress = () => {
        setActiveTab('drivingLicense');
        if (!drivingLicence && !licenceLoading) {
            fetchDrivingLicence();
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

    // Driving License Image Viewer

    if (selectedLicence) {
        return (
            <View style={styles.pdfScreen}>
                <View style={styles.pdfHeader}>
                    <TouchableOpacity
                        testID="licence-back-button"
                        style={styles.backButton}
                        onPress={() => setSelectedLicence(null)}
                    >
                        <Icon source="arrow-left" size={24} color={theme.black} />
                    </TouchableOpacity>
                    <Text style={styles.pdfHeaderTitle} numberOfLines={1}>
                        {selectedLicence.title}
                    </Text>
                </View>
                <View style={styles.pdfContainer}>
                    <Image
                        source={{ uri: selectedLicence.url }}
                        style={styles.pdf}
                        resizeMode="contain"
                    />
                </View>
            </View>
        );
    }

    // PDF viewer

    if (selectedQualification) {
        return (
            <View style={styles.pdfScreen}>
                <View style={styles.pdfHeader}>
                    <TouchableOpacity
                        testID="pdf-back-button"
                        style={styles.backButton}
                        onPress={() => setSelectedQualification(null)}
                    >
                        <Icon source="arrow-left" size={24} color={theme.black} />
                    </TouchableOpacity>
                    <Text style={styles.pdfHeaderTitle} numberOfLines={1}>
                        {selectedQualification.title}
                    </Text>
                </View>
                <View style={styles.pdfContainer}>
                    <Pdf
                        source={{ uri: selectedQualification.url, cache: false }}
                        trustAllCerts={false}
                        style={styles.pdf}
                        onError={(error) => {
                            console.error('PDF error:', error);
                            Alert.alert('Error', 'Failed to load PDF.');
                        }}
                    />
                </View>
            </View>
        );
    }

    // Main list
    return (
        <View style={styles.screen}>

            {/* Category Toggle */}
            <View style={styles.categoryToggleContainer}>
                <View style={[
                    styles.categoryButtonWrapper,
                    activeTab === 'qualifications' && styles.categoryButtonWrapperActive,
                ]}>
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => setActiveTab('qualifications')}
                    >
                        <Text style={[
                            styles.categoryButtonText,
                            activeTab === 'qualifications' && styles.categoryButtonTextActive,
                        ]}>
                            Qualifications
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[
                    styles.categoryButtonWrapper,
                    activeTab === 'drivingLicense' && styles.categoryButtonWrapperActive,
                ]}>
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={handleDrivingLicenceTabPress}
                    >
                        <Text style={[
                            styles.categoryButtonText,
                            activeTab === 'drivingLicense' && styles.categoryButtonTextActive,
                        ]}>
                            Driving License
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Qualifications List */}
            {activeTab === 'qualifications' ? (
                <FlatList
                    data={qualifications}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconContainer}>
                                    <Icon
                                        source="file-document-outline"
                                        size={22}
                                        color={theme.greyPrimaryMainText}
                                    />
                                </View>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <Text style={styles.cardSubtitle}>{item.details}</Text>
                                </View>
                            </View>
                            <Button
                                mode="contained"
                                icon="eye"
                                onPress={() => setSelectedQualification(item)}
                                style={styles.viewButton}
                                labelStyle={styles.buttonLabel}
                                contentStyle={styles.buttonContent}
                            >
                                View
                            </Button>
                        </View>
                    )}
                />
            ) : (

                /* Driving Licence Tab */
                <View style={styles.licenceContainer}>
                    {licenceLoading ? (
                        <ActivityIndicator size="large" color={theme.redPrimary} />
                    ) : licenceError ? (
                        <Text style={styles.cardSubtitle}>Failed to load driving licence.</Text>
                    ) : drivingLicence ? (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconContainer}>
                                    <Icon
                                        source="card-account-details-outline"
                                        size={22}
                                        color={theme.greyPrimaryMainText}
                                    />
                                </View>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>{drivingLicence.title}</Text>
                                </View>
                            </View>
                            <Button
                                mode="contained"
                                icon="eye"
                                onPress={() => setSelectedLicence(drivingLicence)}
                                style={styles.viewButton}
                                labelStyle={styles.buttonLabel}
                                contentStyle={styles.buttonContent}
                            >
                                View
                            </Button>
                        </View>
                    ) : (
                        <Text style={styles.cardSubtitle}>No driving licence on record.</Text>
                    )}
                </View>
            )}

        </View>
    );
}