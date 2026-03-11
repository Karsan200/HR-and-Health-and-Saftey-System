import React, {useState} from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import { ThemeProvider } from "./src/theme/colourController";
import HomeScreen from "./src/screens/HomeScreen";
import HsOverview from './src/screens/HsOverview';
import BottomNavBar from "./src/components/BottomNavBar";
import {AppSection, ScreenKey} from "./src/logic/NavigationConfiguration";
import TopNavBar from './src/components/TopNavBar';
import SettingsScreen from './src/screens/personal/SettingsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DateDetailsScreen from './src/screens/DateDetailsScreen';


function App() {
    const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
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

    // Used for general navigation - pass in a screen (If it's new, add to ScreenKey and add a case handle in renderScreen)
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
                        onSelectSettings={() => handleNavigate('settings')}
                        onSelectLogout={() => handleNavigate('logout')}
                        onSelectProfile={() => handleNavigate('profile')}
                        onSelectNotifications={() => handleNavigate('notifications')}
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

          case 'settings':
            return <>
              <TopNavBar title="Settings"
                         showBackButton={true}
                         onBackPress={() => handleNavigate('home')}
              />
              <View style={styles.content}>
                <SettingsScreen />
              </View>
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
              onBackPress={handleBack} <-- Replace handle back with () => handleNavigate('#previousPage#')
            />
             */

            // Defaulting to the home screen
            default:
                return (
                    <HomeScreen
                        onSelectHr={handleSelectHr}
                        onSelectHealthSafety={handleSelectHealthSafety}
                        onSelectSettings={() => handleNavigate('settings')}
                        onSelectLogout={() => handleNavigate('logout')}
                        onSelectNotifications={() => handleNavigate('notifications')}
                        onSelectProfile={() => handleNavigate('profile')}
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
