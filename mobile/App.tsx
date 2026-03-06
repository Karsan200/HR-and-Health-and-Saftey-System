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
import BottomNavBar from "./src/components/BottomNavBar.tsx";
import {AppSection, ScreenKey} from "./src/logic/NavigationConfiguration.ts";


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
          return <View style={styles.content} />;

        case 'payslips':
          return <View style={styles.content} />;

        case 'handbook':
          return <View style={styles.content} />;

        case 'clockIn':
          return <View style={styles.content} />;

        case 'overview':
          return <View style={styles.content} />;

        case 'documents':
          return <View style={styles.content} />;

        case 'risk':
          return <View style={styles.content} />;

        case 'personal':
          return <View style={styles.content} />;

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
