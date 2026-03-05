import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { settingsStyles as styles } from './SettingsScreen.styles';

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/*All quick access buttons*/}
      <View style={styles.quickAccessContainer}>
        <Text style={styles.quickAccessTitle}>Accessibility Settings</Text>
        {/*TO DO: Fill with the Accessibility Settings*/}
        <Text style={styles.quickAccessTitle}>Colour Themes</Text>
        {/*TO DO: Fill with the Colour Theme Settings*/}
      </View>
    </ScrollView>
  );
}