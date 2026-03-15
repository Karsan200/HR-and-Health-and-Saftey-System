import HomeScreen from '../screens/HomeScreen.tsx';
import TopNavBar from '../components/TopNavBar.tsx';
import CalendarScreen from '../screens/CalendarScreen.tsx';
import DateDetailsScreen from '../screens/DateDetailsScreen.tsx';
import { View } from 'react-native';
import HsOverview from '../screens/HsOverview.tsx';
import SettingsScreen from '../screens/personal/SettingsScreen.tsx';
import React from 'react';

import { ScreenConfigStyles as styles } from './ScreenConfig.styles.ts';
import { ScreenKey } from '../logic/NavigationConfiguration.ts';
import { ScreenConfigProps } from '../model/props/ScreenConfigProps.ts';

export function ScreenConfig(body: ScreenConfigProps) {
  // Defaulting to the calendar screen when the HR section is selected.
  const handleSelectHr = () => {
    body.setSection('hr');
    body.setCurrentScreen('calendar');
  };

  // Defaulting to the overview screen when the Health and Safety section is selected.
  const handleSelectHealthSafety = () => {
    body.setSection('health-safety');
    body.setCurrentScreen('overview');
  };

  // Used for general navigation - pass in a screen (If it's new, add to ScreenKey and add a case handle in renderScreen)
  const handleNavigate = (screen: ScreenKey) => {
    if (screen === 'home') {
      body.setSection(null);
      body.setCurrentScreen('home');
      return;
    }

    body.setCurrentScreen(screen);
  };

  const handleOpenDateDetails = (date: string) => {
    body.setSelectedDate(date);
    body.setCurrentScreen('dateDetails');
  };

  switch (body.currentScreen) {
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
          <DateDetailsScreen date={body.selectedDate} />
        </>
      );

    case 'payslips':
      return (
        <>
          <TopNavBar title="Payslips" />
          <View style={styles.content} />
        </>
      );

    case 'handbook':
      return (
        <>
          <TopNavBar title="Handbook" />
          <View style={styles.content} />
        </>
      );

    case 'clockIn':
      return (
        <>
          <TopNavBar title="Clock-In" />
          <View style={styles.content} />
        </>
      );

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
      return (
        <>
          <TopNavBar title="Documents" />
          <View style={styles.content} />
        </>
      );

    case 'risk':
      return (
        <>
          <TopNavBar title="Risk" />
          <View style={styles.content} />
        </>
      );

    case 'personal':
      return (
        <>
          <TopNavBar title="Personal" />
          <View style={styles.content} />
        </>
      );

    case 'settings':
      return (
        <>
          <TopNavBar
            title="Settings"
            showBackButton={true}
            onBackPress={() => handleNavigate('home')}
          />
          <View style={styles.content}>
            <SettingsScreen />
          </View>
        </>
      );

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
          onSelectProfile={() => handleNavigate('profile')}
          onSelectNotifications={() => handleNavigate('notifications')}
        />
      );
  }
}