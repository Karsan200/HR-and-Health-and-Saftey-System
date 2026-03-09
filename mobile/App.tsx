/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import HomeScreen from "./src/screens/HomeScreen.tsx";
import HsOverview from './src/screens/HsOverview';
import BottomNavBar from "./src/components/BottomNavBar.tsx";
import {AppSection, ScreenKey} from "./src/logic/NavigationConfiguration.ts";
import TopNavBar from './src/components/TopNavBar.tsx';


function App() {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AppContent />
        </SafeAreaProvider>
    );
}

function AppContent() {
    const [section, setSection] = useState<AppSection>(null);
    const [currentScreen, setCurrentScreen] = useState<ScreenKey>('home');

    // Defaulting to the calendar screen when the HR section is selected.
    const handleSelectHr = () => {
        setSection('hr');
        setCurrentScreen('calendar');
    };

    // Defaulting to the overview screen when the Health and Safety section is selected.
    const handleSelectHealthSafety = () => {
        setSection('health-safety');
        setCurrentScreen('overview');
    };

    // When the home screen is selected, the user is taken back to the HomeScreen
    const handleNavigate = (screen: ScreenKey) => {
        if (screen === 'home') {
            setSection(null);
            setCurrentScreen('home');
            return;
        }

        setCurrentScreen(screen);
    };

    /*
    Rendering in the main content area based on the current screen.
    Using switch cases to select the screen to load in.
    At the moment they are all blank view, they will need to be replaced by the screen components when they are created.
     */
    const renderScreen = () => {
        switch (currentScreen) {
            case 'home':
                return (
                    <HomeScreen
                        onSelectHr={handleSelectHr}
                        onSelectHealthSafety={handleSelectHealthSafety}
                    />
                );

            case 'calendar':
                return <>
                    <TopNavBar title="Calendar" />
                    <View style={styles.content} />
                </>;

            case 'payslips':
                return <>
                    <TopNavBar title="Payslips" />
                    <View style={styles.content} />
                </>;

            case 'handbook':
                return <>
                    <TopNavBar title="Handbook" />
                    <View style={styles.content} />
                </>;

            case 'clockIn':
                return <>
                    <TopNavBar title="Clock-In" />
                    <View style={styles.content} />
                </>;

            case 'overview':
                return (
                    <>
                        <TopNavBar title="Overview" />
                        <View style={styles.content}>
                            <HsOverview />
                        </View>
                    </>
                );

            case 'documents':
                return <>
                    <TopNavBar title="Documents" />
                    <View style={styles.content} />
                </>;

            case 'risk':
                return <>
                    <TopNavBar title="Risk" />
                    <View style={styles.content} />
                </>;

            case 'personal':
                return <>
                    <TopNavBar title="Personal" />
                    <View style={styles.content} />
                </>;

            /*
            How to add the top nav bar to a screen:
            Main screen:
            <TopNavBar
              title="NameOfTheScreen"
            />

            Sub-screen:
            <TopNavBar
              title="NameOfTheScreen"
              showBackButton={true}
              onBackPress={handleBack}
            />
             */

            // Defaulting to the home screen
            default:
                return (
                    <HomeScreen
                        onSelectHr={handleSelectHr}
                        onSelectHealthSafety={handleSelectHealthSafety}
                    />
                );
        }
    };


    // returning the main content and the bottom navbar
    return (
        <>
            <View style={styles.content}>{renderScreen()}</View>
            <BottomNavBar
                section={section}
                currentScreen={currentScreen}
                onNavigate={handleNavigate}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    }
});

export default App;
