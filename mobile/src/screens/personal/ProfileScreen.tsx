import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';

import { ThemeContext } from '../../theme/colourController';
import { profileStyles as styles } from './ProfileScreen.styles';

import ProfileService from '../../logic/ProfileService';
import { ProfileModel } from '../../model/response/ProfileModel';

const ProfileScreen = () => {
  const { theme } = useContext(ThemeContext);

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
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.redPrimary} />
      </View>
    );
  }

  // Display error if profile is not loaded
  if (!profile) {
    return <Text>Error loading profile</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      {/* Profile Avatar */}
      <Avatar.Icon
        size={150}
        icon="account-circle"
        color={theme.redPrimary}
        style={styles(theme).avatar}
      />

      {/* Name */}
      <View style={styles(theme).textContainer}>
        <Text style={styles(theme).name}>
          {profile.firstName} {profile.lastName}
        </Text>
        <Text style={styles(theme).role}>Technician</Text>
      </View>

      {/* Edit Button */}
      <Pressable style={styles(theme).editButton}>
        <IconButton icon="pencil" size={16} iconColor={theme.white} />
        <Text style={styles(theme).editText}>Edit Profile</Text>
      </Pressable>

      {/* Personal Details */}
      <View style={styles(theme).card}>
        <Text style={styles(theme).cardTitle}>Personal Details</Text>

        {/* Email */}
        <View style={styles(theme).row}>
          <View
            style={[
              styles(theme).iconBox,
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
            <Text style={styles(theme).label}>Email</Text>
            <Text style={styles(theme).value}>{profile.email}</Text>
          </View>
        </View>

        {/* Phone */}
        <View style={styles(theme).row}>
          <View
            style={[
              styles(theme).iconBox,
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
            <Text style={styles(theme).label}>Phone</Text>
            <Text style={styles(theme).value}>
              {profile.phoneNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* Employee Details */}
      <View style={styles(theme).card}>
        <Text style={styles(theme).cardTitle}>Employee Details</Text>

        {/* Hardcoded Position */}
        <View style={styles(theme).row}>
          <View
            style={[
              styles(theme).iconBox,
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
            <Text style={styles(theme).label}>Position</Text>
            <Text style={styles(theme).value}>Technician</Text>
          </View>
        </View>

        {/* Join Date */}
        <View style={styles(theme).row}>
          <View
            style={[
              styles(theme).iconBox,
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
            <Text style={styles(theme).label}>Join Date</Text>
            <Text style={styles(theme).value}>{profile.created}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
