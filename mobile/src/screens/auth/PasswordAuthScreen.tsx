import React, { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { Text, Image, ScrollView } from 'react-native';
import { TextInput, Button, Avatar, Dialog, Portal } from 'react-native-paper';

import { colours } from '../../theme/colours.ts';
import { passwordAuthScreenStyles as styles } from './PasswordAuthScreen.styles.ts';
import { homeStyles } from '../HomeScreen.styles.ts';
import authenticationService from '../../logic/AuthenticationService.ts';
import { HttpException } from '../../exception/HttpException.ts';
import { JSX } from 'react/jsx-runtime';

export default function PasswordAuthScreen(props: { isAuth: Dispatch<SetStateAction<boolean | null>> }): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    // Check that there is a username and password entered
    if (!username || !password) {
      setError('Please enter both a username and password');
      setVisible(true);
      return;
    }

    // Send the request to the server
    try {
      await authenticationService.login(
        {"username": username, "password": password, isMobile: true}
      );

      // If successful, route the user to the home screen of the app
      props.isAuth(true);
    }
    catch (e) {
      if (e instanceof HttpException && e.statusCode === 401) {
        setError('Invalid username or password entered');
        setVisible(true);
      }
      else if (e instanceof HttpException && e.statusCode === 404) {
        setError('No user exists with the provided username. Please check your username and try again.');
        setVisible(true);
      }
      else {
        console.log(e)
        setError('An unknown error occurred during login. Please try again later.');
        setVisible(true);
      }
    }
  }

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
        onPress={() => handleLogin()}
      >
        Login
      </Button>
      {/** TODO: Add forgot password functionality */}
      <Text style={styles.forgotPasswordText}>Forgot Password</Text>
      {/** Error message dialog */}
      <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
              <Dialog.Title>Error</Dialog.Title>
              <Dialog.Content>
                  <Text style={styles.dialogText}>{error}</Text>
              </Dialog.Content>
              <Dialog.Actions>
                  <Button
                      textColor={colours.redTextDark}
                      onPress={() => setVisible(false)}
                  >OK</Button>
              </Dialog.Actions>
          </Dialog>
      </Portal>
    </ScrollView>
  );
}