import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CalendarScreen from './src/screens/CalendarScreen';
import DateDetailsScreen from './src/screens/DateDetailsScreen';

// Navigation types
export type RootStackParamList = {
  Calendar: undefined;
  DayDetails: { date: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        <Stack.Navigator>
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="DayDetails"
            component={DateDetailsScreen}
            options={{ title: 'Day Details' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
