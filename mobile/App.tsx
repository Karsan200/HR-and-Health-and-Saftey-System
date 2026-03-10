/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import { PaperProvider } from 'react-native-paper';
import { paperTheme } from './src/theme/paperTheme.ts';
import HsOverview from './src/screens/HsOverview';
import BottomNavBar from "./src/components/BottomNavBar";
import {AppSection, ScreenKey} from "./src/logic/NavigationConfiguration.ts";
import TopNavBar from './src/components/TopNavBar';
import CalendarScreen from './src/screens/CalendarScreen';
import DateDetailsScreen from './src/screens/DateDetailsScreen';


function App() {
    const isDarkMode = useColorScheme() === 'dark';

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </PaperProvider >
  );
}

function AppContent() {
    const [section, setSection] = useState<AppSection>(null);
    const [currentScreen, setCurrentScreen] = useState<ScreenKey>('home');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

    const handleOpenDateDetails = (date: string) => {
      setSelectedDate(date);
      setCurrentScreen('dateDetails');
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
          return (
            <>
              <TopNavBar title="Calendar" />
              <CalendarScreen onDayPress={handleOpenDateDetails} />
            </>
          );

        case 'dateDetails':
          return (
            <>
              <TopNavBar
                title=""
                showBackButton={true}
                onBackPress={() => handleNavigate('calendar')}
              />
              <DateDetailsScreen date={selectedDate} />
            </>
          );

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
