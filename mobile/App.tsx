/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext, useEffect, useState} from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';

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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await AuthenticationService.refresh();
        setIsAuthenticated(true);
      } catch (error) {
        console.log(error);
        if (error instanceof HttpException && error.statusCode === 401) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  const theme = useContext(ThemeContext);

  return (
    <ThemeProvider>
      <PaperProvider theme={paperTheme(theme)}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {isAuthenticated === null ? (
          <LogoActivityIndicator />
        ) : isAuthenticated ? (
          <AppContent />
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
