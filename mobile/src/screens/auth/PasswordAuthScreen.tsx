import React, {Dispatch, SetStateAction, useContext} from 'react';
import { useState } from 'react';
import { Text, Image, ScrollView } from 'react-native';
import { TextInput, Button, Avatar, Dialog, Portal } from 'react-native-paper';

import { passwordAuthScreenStyles as styles } from './PasswordAuthScreen.styles.ts';
import { homeStyles } from '../HomeScreen.styles.ts';
import authenticationService from '../../logic/AuthenticationService.ts';
import { HttpException } from '../../exception/HttpException.ts';
import { JSX } from 'react/jsx-runtime';
import { ThemeContext } from "../../theme/colourController.tsx";

export default function PasswordAuthScreen(props: { isAuth: Dispatch<SetStateAction<boolean | null>> }): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  const { theme, accessibility } = useContext(ThemeContext)

  const themedStyles = styles(theme, accessibility);
  const homeThemedStyles = homeStyles(theme, accessibility);

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
    <ScrollView contentContainerStyle={themedStyles.container}>
      <ScrollView contentContainerStyle={themedStyles.imageContainer}>
        <Image
          source={require('../../assets/images/Rent-a-Tech-Logo.png')}
          style={themedStyles.image}
        />
      </ScrollView>
      <Avatar.Icon
        size={300}
        icon="account-circle"
        style={homeThemedStyles.profileIcon}
        color={theme.redPrimary}
      />
      <TextInput
        label="Username"
        mode="outlined"
        style={themedStyles.inputStyle}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        label="Password"
        mode="outlined"
        style={themedStyles.inputStyle}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        buttonColor={theme.redPrimary}
        textColor={theme.white}
        style={themedStyles.inputStyle}
        onPress={() => handleLogin()}
      >
        Login
      </Button>
      {/** TODO: Add forgot password functionality */}
      <Text style={themedStyles.forgotPasswordText}>Forgot Password</Text>
      {/** Error message dialog */}
      <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
              <Dialog.Title>Error</Dialog.Title>
              <Dialog.Content>
                  <Text style={themedStyles.dialogText}>{error}</Text>
              </Dialog.Content>
              <Dialog.Actions>
                  <Button
                      textColor={theme.redTextDark}
                      onPress={() => setVisible(false)}
                  >OK</Button>
              </Dialog.Actions>
          </Dialog>
      </Portal>
    </ScrollView>
  );
}