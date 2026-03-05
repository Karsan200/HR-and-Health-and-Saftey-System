/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen.tsx';
import { PaperProvider } from 'react-native-paper';
import PasswordAuthScreen from './src/screens/auth/PasswordAuthScreen.tsx';
import { paperTheme } from './src/theme/paperTheme.ts';


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

  return (
    <View style={styles.container}>
        <PasswordAuthScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
