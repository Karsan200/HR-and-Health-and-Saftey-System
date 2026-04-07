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

  const [BleUUID, setBleUUID] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await AuthenticationService.refresh();
        setIsAuthenticated(true);

        // get the BLE UUID for the device and store it in state
        const response = await AuthenticationService.fetch(
          '/api/attendance/signature',
          {
            method: 'GET',
          },
        );

        const data = await response.json();
        setBleUUID(data.signature);

        // load the background service for BLE attendance tracking
        const options = {
          taskName: 'Example',
          taskTitle: 'ExampleTask title',
          taskDesc: 'ExampleTask description',
          taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
          },
          color: '#ff00ff',
          linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
          parameters: {
            broadcastId: BleUUID,
          } satisfies BleBroadcastTaskArgs,
        };
        await BackgroundService.start(BleBroadcastHook, options);
      } catch (error) {
        console.log(error);
        if (error instanceof HttpException && error.statusCode === 401) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, [BleUUID, isAuthenticated]);

  const theme = useContext(ThemeContext);

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
