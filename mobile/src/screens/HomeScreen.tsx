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
  const { theme, accessibility } = useContext(ThemeContext);
  const themedStyles = styles(theme, accessibility);

  return (
    <ScrollView contentContainerStyle={themedStyles.container}>
      {/* Profile Icon */}
      <Avatar.Icon
        size={150}
        icon="account-circle"
        style={themedStyles.profileIcon}
        color={theme.redPrimary} // dynamic color from context
      />

      {/* Welcome Text */}
      <Text style={themedStyles.welcomeText}>Welcome Back</Text>
      <Text style={themedStyles.userName}>Maggie May</Text>

      {/* Section Selection */}
      <Text style={themedStyles.sectionTitle}>CHOOSE A SECTION</Text>

      {/* HR Portal */}
      <Pressable style={themedStyles.sectionButton} onPress={onSelectHr}>
        <View style={themedStyles.sectionButtonContent}>
          <IconButton
            icon="briefcase-outline"
            size={35}
            iconColor={theme.black}
            containerColor="transparent"
            style={themedStyles.iconButton}
          />
          <Text style={themedStyles.sectionButtonText}>HR Portal</Text>
        </View>
      </Pressable>

      {/* Health & Safety */}
      <Pressable style={themedStyles.sectionButton} onPress={onSelectHealthSafety}>
        <View style={themedStyles.sectionButtonContent}>
          <IconButton
            icon="shield-outline"
            size={35}
            iconColor={theme.black}
            containerColor="transparent"
            style={themedStyles.iconButton}
          />
          <Text style={themedStyles.sectionButtonText}>Health &amp; Safety</Text>
        </View>
      </Pressable>

      {/* Quick Access Buttons */}
      <View style={themedStyles.quickAccessContainer}>
        <Text style={themedStyles.quickAccessTitle}>QUICK ACCESS</Text>

        {/* Profile */}
        <Pressable style={themedStyles.quickAccessButtonContainer} onPress={onSelectProfile}>
          <View style={themedStyles.quickAccessButtonContent}>
            <IconButton
              icon="account-circle"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={themedStyles.iconButton}
            />
            <Text style={themedStyles.quickAccessButton}>Profile</Text>
          </View>
        </Pressable>

        {/* Notifications */}
        <Pressable style={themedStyles.quickAccessButtonContainer} onPress={onSelectNotifications}>
          <View style={themedStyles.quickAccessButtonContent}>
            <IconButton
              icon="bell-outline"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={themedStyles.iconButton}
            />
            <Text style={themedStyles.quickAccessButton}>Notifications</Text>
          </View>
        </Pressable>

        {/* Settings */}
        <Pressable style={themedStyles.quickAccessButtonContainer} onPress={onSelectSettings}>
          <View style={themedStyles.quickAccessButtonContent}>
            <IconButton
              icon="cog"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={themedStyles.iconButton}
            />
            <Text style={themedStyles.quickAccessButton}>Settings</Text>
          </View>
        </Pressable>

        {/* Logout */}
        <Pressable style={themedStyles.quickAccessButtonContainer} onPress={onSelectLogout}>
          <View style={themedStyles.quickAccessButtonContent}>
            <IconButton
              icon="logout"
              size={24}
              iconColor={theme.black}
              containerColor="transparent"
              style={themedStyles.iconButton}
            />
            <Text style={themedStyles.quickAccessButton}>Logout</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}