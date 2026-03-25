import HomeScreen from '../screens/HomeScreen.tsx';
import TopNavBar from '../components/TopNavBar.tsx';
import CalendarScreen from '../screens/CalendarScreen.tsx';
import DateDetailsScreen from '../screens/DateDetailsScreen.tsx';
import { View } from 'react-native';
import HsOverview from '../screens/HsOverview.tsx';
import SettingsScreen from '../screens/personal/SettingsScreen.tsx';
import ProfileScreen from '../screens/personal/ProfileScreen.tsx';
import React from 'react';

import { ScreenConfigStyles as styles } from './ScreenConfig.styles.ts';
import { ScreenKey } from '../logic/NavigationConfiguration.ts';
import { ScreenConfigProps } from '../model/props/ScreenConfigProps.ts';
import HazardForm from "../screens/HazardForm.tsx";
import RiskAssessments from "../screens/RiskAssessments.tsx";
import PayslipScreen from '../screens/PayslipScreen.tsx';
import DocumentsScreen from '../screens/DocumentsScreen.tsx';
import HandbookScreen from "../screens/HandbookScreen.tsx";
import PersonalScreen from "../screens/PersonalScreen.tsx";

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
    } else if (screen === 'hazardForm') {
        body.setSection(null);
        body.setCurrentScreen('hazardForm');
        return;
    } else if (screen === 'profile') {
      body.setSection(null);
      body.setCurrentScreen('profile');
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
          <TopNavBar
            title="Calendar"
          />
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
          <TopNavBar
            title="Payslips"
          />
          <View style={styles.content} />
            <PayslipScreen />
        </>
      );

    case 'handbook':
      return (
        <>
          <TopNavBar
            title="Handbook"
          />
          <View style={styles.content} />
            <HandbookScreen />
        </>
      );

    case 'clockIn':
      return (
        <>
          <TopNavBar
            title="Clock-In"
          />
          <View style={styles.content} />
        </>
      );

    case 'overview':
      return (
        <>
          <TopNavBar
            title="Overview"
          />
          <View style={styles.content}>
            <HsOverview />
          </View>
        </>
      );

    case 'documents':
      return (
        <>
          <TopNavBar
            title="Documents"
          />
          <View style={styles.content} />
            <DocumentsScreen />
        </>
      );

      case 'risk':
      return (
        <>
          <TopNavBar title="Risk" />
          <View style={styles.content}>
            <RiskAssessments onStartAssessment={() => handleNavigate('hazardForm')} />
        </View>
        </>
      );

      case 'hazardForm':
          return (
              <>
                  <TopNavBar
                      title="Hazard Form"
                      showBackButton={true}
                      onBackPress={() => handleNavigate('risk')}
                  />
                  <View style={styles.content}>
                      <HazardForm onDone={() => handleNavigate('risk')} />
                  </View>
              </>
          );

    case 'personal':
      return (
        <>
          <TopNavBar
            title="Personal"
          />
          <View style={styles.content} />
            <PersonalScreen />
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

    case 'profile':
      return (
        <>
          <TopNavBar
            title="Profile"
            showBackButton={true}
            onBackPress={() => handleNavigate('home')}
          />
          <View style={styles.content}>
            <ProfileScreen />
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