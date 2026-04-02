import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';

import { ThemeContext } from '../../theme/colourController';
import { profileStyles as styles } from './ProfileScreen.styles';

import ProfileService from '../../logic/ProfileService';
import { ProfileModel } from '../../model/response/ProfileModel';

interface ProfileScreenProps {
  onEditProfile: () => void;
}

const ProfileScreen = ({ onEditProfile }: ProfileScreenProps) => {
  const { theme, accessibility } = useContext(ThemeContext);
  const themedStyles = styles(theme, accessibility);

  const [profile, setProfile] = useState<ProfileModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data when page loads
  useEffect(() => {
    (async () => {
      try {
        const data = await ProfileService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Show loading indicator when profile is loading
  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.redPrimary} />
      </View>
    );
  }

  // Display error if profile is not loaded
  if (!profile) {
    return <Text>Error loading profile</Text>;
  }

  return (
    <ScrollView contentContainerStyle={themedStyles.container}>
      {/* Profile Avatar */}
      <Avatar.Icon
        size={150}
        icon="account-circle"
        color={theme.redPrimary}
        style={themedStyles.avatar}
      />

      {/* Name */}
      <View style={themedStyles.textContainer}>
        <Text style={themedStyles.name}>
          {profile.firstName} {profile.lastName}
        </Text>
        <Text style={themedStyles.role}>Technician</Text>
      </View>

      {/* Edit Button */}
      <Pressable style={themedStyles.editButton} onPress={onEditProfile}>
        <IconButton icon="pencil" size={16} iconColor={theme.white} />
        <Text style={themedStyles.editText}>Edit Profile</Text>
      </Pressable>

      {/* Personal Details */}
      <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>Personal Details</Text>

        {/* Email */}
        <View style={themedStyles.row}>
          <View
            style={[
              themedStyles.iconBox,
              { backgroundColor: theme.redBackgroundLight },
            ]}
          >
            <IconButton
              icon="email-outline"
              size={20}
              iconColor={theme.redTextDark}
            />
          </View>
          <View>
            <Text style={themedStyles.label}>Email</Text>
            <Text style={themedStyles.value}>{profile.email}</Text>
          </View>
        </View>

        {/* Phone */}
        <View style={themedStyles.row}>
          <View
            style={[
              themedStyles.iconBox,
              { backgroundColor: theme.redBackgroundLight },
            ]}
          >
            <IconButton
              icon="phone-outline"
              size={20}
              iconColor={theme.redTextDark}
            />
          </View>
          <View>
            <Text style={themedStyles.label}>Phone</Text>
            <Text style={themedStyles.value}>
              {profile.phoneNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* Employee Details */}
      <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>Employee Details</Text>

        {/* Hardcoded Position */}
        <View style={themedStyles.row}>
          <View
            style={[
              themedStyles.iconBox,
              { backgroundColor: theme.greenBackgroundLight },
            ]}
          >
            <IconButton
              icon="account-outline"
              size={20}
              iconColor={theme.greenTextDark}
            />
          </View>
          <View>
            <Text style={themedStyles.label}>Position</Text>
            <Text style={themedStyles.value}>Technician</Text>
          </View>
        </View>

        {/* Join Date */}
        <View style={themedStyles.row}>
          <View
            style={[
              themedStyles.iconBox,
              { backgroundColor: theme.greenBackgroundLight },
            ]}
          >
            <IconButton
              icon="calendar-outline"
              size={20}
              iconColor={theme.greenTextDark}
            />
          </View>
          <View>
            <Text style={themedStyles.label}>Join Date</Text>
            <Text style={themedStyles.value}>{profile.created}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
