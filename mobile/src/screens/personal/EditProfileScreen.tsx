import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { ThemeContext } from '../../theme/colourController';
import { editProfileStyles as styles } from './EditProfileScreen.styles';
import ProfileService from '../../logic/ProfileService';

// Validation helpers

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,17}$/;

interface FieldErrors {
  email?: string;
  phone?: string;
  username?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

function validate(
  email: string,
  phone: string,
  username: string,
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): FieldErrors {
  const errors: FieldErrors = {};

  if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (username.trim() && username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  const hasOld = oldPassword.trim().length > 0;
  const hasNew = newPassword.trim().length > 0;
  const hasConfirm = confirmNewPassword.trim().length > 0;

  if (hasOld || hasNew || hasConfirm) {
    if (!hasOld) errors.oldPassword = 'Please enter your current password';
    if (!hasNew) errors.newPassword = 'Please enter a new password';
    else if (newPassword.length < 8)
      errors.newPassword = 'New password must be at least 8 characters';
    if (!hasConfirm)
      errors.confirmNewPassword = 'Please confirm your new password';
    else if (hasNew && newPassword !== confirmNewPassword)
      errors.confirmNewPassword = 'Passwords do not match';
  }

  return errors;
}

// Component

const EditProfileScreen = () => {
  const { theme, accessibility } = useContext(ThemeContext);
  const themedStyles = styles(theme, accessibility);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const clearError = (field: keyof FieldErrors) =>
    setErrors(prev => ({ ...prev, [field]: undefined }));

  const handleSave = async () => {
    const validationErrors = validate(
      email,
      phone,
      username,
      oldPassword,
      newPassword,
      confirmNewPassword,
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await ProfileService.updateProfile({
        email,
        phoneNumber: phone,
        username,
        oldPassword,
        newPassword,
        confirmNewPassword,
      });

      // Clear password fields after a successful save
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Something went wrong. Please try again.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

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
            onChangeText={v => {
              setEmail(v);
              clearError('email');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.greyIconLight}
            placeholder="New Email"
          />
          {errors.email && (
            <Text style={themedStyles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Phone */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Phone</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={phone}
            onChangeText={v => {
              setPhone(v);
              clearError('phone');
            }}
            keyboardType="phone-pad"
            placeholderTextColor={theme.greyIconLight}
            placeholder="New Phone Number"
          />
          {errors.phone && (
            <Text style={themedStyles.errorText}>{errors.phone}</Text>
          )}
        </View>
      </View>

      {/* Profile Section */}
      <Text style={themedStyles.sectionTitle}>Profile</Text>

      <View style={themedStyles.fieldsGroup}>
        {/* Username */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Username</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={username}
            onChangeText={v => {
              setUsername(v);
              clearError('username');
            }}
            autoCapitalize="none"
            placeholderTextColor={theme.greyIconLight}
            placeholder="New Username"
          />
          {errors.username && (
            <Text style={themedStyles.errorText}>{errors.username}</Text>
          )}
        </View>

        {/* Old Password */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Old Password</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={oldPassword}
            onChangeText={v => {
              setOldPassword(v);
              clearError('oldPassword');
            }}
            secureTextEntry
            placeholderTextColor={theme.greyIconLight}
            placeholder="Required to change password"
          />
          {errors.oldPassword && (
            <Text style={themedStyles.errorText}>{errors.oldPassword}</Text>
          )}
        </View>

        {/* New Password */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>New Password</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={newPassword}
            onChangeText={v => {
              setNewPassword(v);
              clearError('newPassword');
            }}
            secureTextEntry
            placeholderTextColor={theme.greyIconLight}
            placeholder="Min. 8 characters"
          />
          {errors.newPassword && (
            <Text style={themedStyles.errorText}>{errors.newPassword}</Text>
          )}
        </View>

        {/* Confirm New Password */}
        <View style={themedStyles.fieldCard}>
          <Text style={themedStyles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={themedStyles.fieldInput}
            value={confirmNewPassword}
            onChangeText={v => {
              setConfirmNewPassword(v);
              clearError('confirmNewPassword');
            }}
            secureTextEntry
            placeholderTextColor={theme.greyIconLight}
            placeholder="Re-enter new password"
          />
          {errors.confirmNewPassword && (
            <Text style={themedStyles.errorText}>
              {errors.confirmNewPassword}
            </Text>
          )}
        </View>
      </View>

      {/* Save Button */}
      <View style={themedStyles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            themedStyles.saveButton,
            pressed && themedStyles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <Text style={themedStyles.saveButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
