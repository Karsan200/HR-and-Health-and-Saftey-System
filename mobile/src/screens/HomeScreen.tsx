import React, { useContext } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { homeStyles as styles } from './HomeScreen.styles';
import { ThemeContext } from '../theme/colourController';

type HomeScreenProps = {
  onSelectHr: () => void;
  onSelectHealthSafety: () => void;
  onSelectSettings: () => void;
  onSelectProfile: () => void;
  onSelectLogout: () => void;
  onSelectNotifications: () => void;
};

export default function HomeScreen({
                                     onSelectHr,
                                     onSelectHealthSafety,
                                     onSelectSettings,
                                     onSelectLogout,
                                     onSelectNotifications,
                                     onSelectProfile,
                                   }: HomeScreenProps) {
  // Pull the current theme from the ThemeContext
  const { theme } = useContext(ThemeContext);

  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      {/* Profile Icon */}
      <Avatar.Icon
        size={150}
        icon="account-circle"
        style={styles(theme).profileIcon}
        color={theme.redPrimary} // dynamic color from context
      />

      {/* Welcome Text */}
      <Text style={styles(theme).welcomeText}>Welcome Back</Text>
      <Text style={styles(theme).userName}>Maggie May</Text>

      {/* Section Selection */}
      <Text style={styles(theme).sectionTitle}>CHOOSE A SECTION</Text>

      {/* HR Portal */}
      <Pressable style={styles(theme).sectionButton} onPress={onSelectHr}>
        <View style={styles(theme).sectionButtonContent}>
          <IconButton
            icon="briefcase-outline"
            size={35}
            iconColor={theme.black}
            containerColor="transparent"
            style={styles(theme).iconButton}
          />
          <Text style={styles(theme).sectionButtonText}>HR Portal</Text>
        </View>
      </Pressable>

      {/* Health & Safety */}
      <Pressable style={styles(theme).sectionButton} onPress={onSelectHealthSafety}>
        <View style={styles(theme).sectionButtonContent}>
          <IconButton
            icon="shield-outline"
            size={35}
            iconColor={theme.black}
            containerColor="transparent"
            style={styles(theme).iconButton}
          />
          <Text style={styles(theme).sectionButtonText}>Health &amp; Safety</Text>
        </View>
      </Pressable>

      {/* Quick Access Buttons */}
      <View style={styles(theme).quickAccessContainer}>
        <Text style={styles(theme).quickAccessTitle}>QUICK ACCESS</Text>

        {/* Profile */}
        <Pressable style={styles(theme).quickAccessButtonContainer} onPress={onSelectProfile}>
          <View style={styles(theme).quickAccessButtonContent}>
            <IconButton
              icon="account-circle"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={styles(theme).iconButton}
            />
            <Text style={styles(theme).quickAccessButton}>Profile</Text>
          </View>
        </Pressable>

        {/* Notifications */}
        <Pressable style={styles(theme).quickAccessButtonContainer} onPress={onSelectNotifications}>
          <View style={styles(theme).quickAccessButtonContent}>
            <IconButton
              icon="bell-outline"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={styles(theme).iconButton}
            />
            <Text style={styles(theme).quickAccessButton}>Notifications</Text>
          </View>
        </Pressable>

        {/* Settings */}
        <Pressable style={styles(theme).quickAccessButtonContainer} onPress={onSelectSettings}>
          <View style={styles(theme).quickAccessButtonContent}>
            <IconButton
              icon="cog"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={styles(theme).iconButton}
            />
            <Text style={styles(theme).quickAccessButton}>Settings</Text>
          </View>
        </Pressable>

        {/* Logout */}
        <Pressable style={styles(theme).quickAccessButtonContainer} onPress={onSelectLogout}>
          <View style={styles(theme).quickAccessButtonContent}>
            <IconButton
              icon="logout"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={styles(theme).iconButton}
            />
            <Text style={styles(theme).quickAccessButton}>Logout</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}