import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';

import { ThemeContext } from '../../theme/colourController';
import { editProfileStyles as styles } from './EditProfileScreen.styles';

const EditProfileScreen = () => {
  const { theme, accessibility } = useContext(ThemeContext);
  const themedStyles = styles(theme, accessibility);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading] = useState(false);

  const handleSave = async () => {
    // TODO: wire up save logic
  };

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.redPrimary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={themedStyles.container}>
      {/* ── Personal Section ── */}
      <Text style={themedStyles.sectionTitle}>Personal</Text>

      <View style={themedStyles.fieldsGroup}>
        {/* Email */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Email</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.greyIconLight}
          />
          <View/>
        </View>

        {/* Phone */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Phone</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={theme.greyIconLight}
          />
          <View/>
        </View>
      </View>

      {/* ── Profile Section ── */}
      <Text style={themedStyles.sectionTitle}>Profile</Text>

      <View style={themedStyles.fieldsGroup}>
        {/* Username */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Username</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={theme.greyIconLight}
          />
          <View/>
        </View>

        {/* Old Password */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Old Password</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            placeholderTextColor={theme.greyIconLight}
          />
          <View/>
        </View>

        {/* New Password */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>New Password</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor={theme.greyIconLight}
          />
          <View/>
        </View>

        {/* Confirm New Password */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            secureTextEntry
            placeholderTextColor={theme.greyIconLight}
          />
          <View/>
        </View>
      </View>

      {/* ── Save Button ── */}
      <View style={themedStyles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            themedStyles.saveButton,
            pressed && themedStyles.saveButtonPressed,
          ]}
          onPress={handleSave}
        >
          <Text style={themedStyles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
