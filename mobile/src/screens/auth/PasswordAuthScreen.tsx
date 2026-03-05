import React from 'react';
import { useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';

import { colours } from '../../theme/colours.ts';
import { passwordAuthScreenStyles as styles } from './PasswordAuthScreen.styles.ts';
import { homeStyles } from '../HomeScreen.styles.ts';

export default function PasswordAuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScrollView contentContainerStyle={styles.imageContainer}>
        <Image
          source={require('../../assets/images/Rent-a-Tech-Logo.png')}
          style={styles.image}
        />
      </ScrollView>
      <Avatar.Icon
        size={300}
        icon="account-circle"
        style={homeStyles.profileIcon}
        color={colours.redPrimary}
      />
      <TextInput
        label="Username"
        mode="outlined"
        style={styles.inputStyle}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        label="Password"
        mode="outlined"
        style={styles.inputStyle}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        buttonColor={colours.redPrimary}
        textColor={colours.white}
        style={styles.inputStyle}
        onPress={() => console.log('Pressed')}
      >
        Login
      </Button>
      {/** TODO: Add forgot password functionality */}
      <Text style={styles.forgotPasswordText}>Forgot Password</Text>
    </ScrollView>
  );
}