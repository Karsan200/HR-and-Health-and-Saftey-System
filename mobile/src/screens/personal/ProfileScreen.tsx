import React, { useContext } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { ThemeContext } from '../../theme/colourController';
import { profileStyles as styles } from './ProfileScreen.styles';

const ProfileScreen = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <ScrollView contentContainerStyle={styles(theme).container}>
      {/* Profile Avatar */}
      <Avatar.Icon
        size={150}
        icon="account-circle"
        color={theme.redPrimary}
        style={styles(theme).avatar}
      />

      {/* Name + Role */}
      <View style={styles(theme).textContainer}>
        <Text style={styles(theme).name}>Maggie May</Text>
        <Text style={styles(theme).role}>Technician</Text>
        <Text style={styles(theme).employeeId}>ID: EMP-302-354-001</Text>
      </View>

      {/* Edit Button */}
      <Pressable style={styles(theme).editButton}>
        <IconButton
          icon="pencil"
          size={16}
          iconColor={theme.white}
        />
        <Text style={styles(theme).editText}>Edit Profile</Text>
      </Pressable>

      {/* Personal Info */}
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
            <Text style={styles(theme).value}>maggie@email.com</Text>
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
            <Text style={styles(theme).value}>555-555-555</Text>
          </View>
        </View>
      </View>

      {/* Employee Details */}
      <View style={styles(theme).card}>
        <Text style={styles(theme).cardTitle}>Employee Details</Text>

        {/* Position */}
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
            <Text style={styles(theme).value}>15 March 2013</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
