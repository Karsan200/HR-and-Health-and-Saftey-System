/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext, useEffect, useState} from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BackgroundService from 'react-native-background-actions';
import DeviceInfo from 'react-native-device-info';

import AuthenticationService from './src/logic/AuthenticationService.ts';
import { AppSection, ScreenKey } from "./src/logic/NavigationConfiguration.ts";

import { paperTheme } from './src/theme/paperTheme.ts';
import { ThemeProvider } from './src/theme/colourController.tsx'
import { ThemeContext } from './src/theme/colourController.tsx';
import { HttpException } from './src/exception/HttpException.ts';

import BottomNavBar from "./src/components/BottomNavBar";
import LogoActivityIndicator from './src/components/auth/LogoActivityIndicator.tsx';

import PasswordAuthScreen from './src/screens/auth/PasswordAuthScreen.tsx';
import { ScreenConfig } from './src/config/ScreenConfig.tsx';

import { ScreenConfigStyles as styles } from './src/config/ScreenConfig.styles.ts';
import { PinCodeAuthScreen } from "./src/screens/auth/PinCodeAuthScreen.tsx";
import {
  BleBroadcastHook,
  BleBroadcastTaskArgs,
} from './src/hook/BleBroadcastHook.ts';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showPinCodeScreen, setShowPinCodeScreen] = useState(true);

  const theme = useContext(ThemeContext);

  // Run once on mount to check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await AuthenticationService.refresh();
        setIsAuthenticated(true);
      } catch (error) {
        if (error instanceof HttpException && error.statusCode === 401) {
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
  }, []);

// Run only when authenticated to fetch UUID and start BLE
  useEffect(() => {
    if (!isAuthenticated) return;

    const startBle = async () => {
      const isEmulator = await DeviceInfo.isEmulator();

      if (isEmulator) {
        console.warn('Skipping BLE setup on emulator');
        return;
      }

      try {
        const response = await AuthenticationService.fetch('/api/attendance/signature', { method: 'GET' });
        const data = await response.json();

        // Stop any existing background task before starting a new one
        if (BackgroundService.isRunning()) {
          await BackgroundService.stop();
        }

        // Start the background service with the BLE broadcast hook and pass the signature as a parameter
        await BackgroundService.start(BleBroadcastHook, {
          taskName: 'Attendance',
          taskTitle: 'Attendance Tracking',
          taskDesc: 'Your device is being used to track attendance for your shifts. ' +
            'Please keep Bluetooth on and the app running in the background.',
          taskIcon: { name: 'ic_launcher', type: 'mipmap' },
          color: theme.theme.greyBackground,
          parameters: {
            broadcastId: data.signature,
          } satisfies BleBroadcastTaskArgs,
        });
      } catch (error) {
        console.error('BLE setup error:', error);
      }
    };

    startBle();
  }, [isAuthenticated, theme.theme.greyBackground]); // only triggers when auth state changes

    return (
      <ThemeProvider>
        <PaperProvider theme={paperTheme(theme)}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {isAuthenticated === null ? (
            <LogoActivityIndicator />
          ) : isAuthenticated ? (
            showPinCodeScreen ? (
              <PinCodeAuthScreen isAuth={setShowPinCodeScreen} />
            ) : (
              <AppContent />
            )
          ) : (
            <PasswordAuthScreen isAuth={setIsAuthenticated} />
          )}
        </PaperProvider>
      </ThemeProvider>
    );
}

function AppContent() {
    const [section, setSection] = useState<AppSection>(null);
    const [currentScreen, setCurrentScreen] = useState<ScreenKey>('home');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Used for general navigation - pass in a screen (If it's new, add to ScreenKey and add a case handle in renderScreen)
    const handleNavigate = (screen: ScreenKey) => {
        if (screen === 'home') {
            setSection(null);
            setCurrentScreen('home');
            return;
        }

        setCurrentScreen(screen);
    };

    // returning the main content and the bottom navbar
    return (
      <>
        <View style={styles.content}>{ScreenConfig({
            section: section,
            setSection: setSection,
            currentScreen: currentScreen,
            setCurrentScreen: setCurrentScreen,

            selectedDate: selectedDate,
            setSelectedDate: setSelectedDate,
        })}</View>
        <BottomNavBar
          section={section}
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      </>
    );
}

export default App;
