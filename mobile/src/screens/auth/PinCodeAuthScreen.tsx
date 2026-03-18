import {Image, ScrollView, Text, View} from 'react-native';
import {Avatar, Button, Dialog, Portal} from 'react-native-paper';
import React, {Dispatch, SetStateAction, useContext, useState} from 'react';
import { ThemeContext } from '../../theme/colourController.tsx';

import { passwordAuthScreenStyles } from './PasswordAuthScreen.styles.ts';
import { homeStyles } from '../HomeScreen.styles.ts';
import { PinCodeAuthScreen as styles } from './PinCodeAuthScreen.styles.ts';
import {PinCodeBubble} from "../../components/auth/PinCodeBubble.tsx";
import AuthenticationService from "../../logic/AuthenticationService.ts";
import {HttpException} from "../../exception/HttpException.ts";

export function PinCodeAuthScreen(props: { isAuth: Dispatch<SetStateAction<boolean>> }) {
    const [pinCode, setPinCode] = useState('');
    const [pinBubbles, setPinBubbles] = useState([false, false, false, false, false, false]);

    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');

    const { theme } = useContext(ThemeContext)

    async function onButtonPress(buttonValue: string) {
        switch(buttonValue) {
            case "x":
                buttonValue = pinCode.slice(0, -1);
                setPinCode(buttonValue);
                setPinBubbles(pinBubbles.map((_, index) => index < pinCode.length - 1));
                break;
            case ">":
                // This button does not have an actual use, but it can be used to check that
                // the pin code is 6 digits long and display an error message if it is not
                if (pinCode.length !== 6) {
                    setError("Please enter a 6-digit pin code");
                    setVisible(true);
                }
                buttonValue = pinCode;
                break;
            default:
                buttonValue = pinCode + buttonValue
                setPinCode(buttonValue);
                setPinBubbles(pinBubbles.map((_, index) => index < pinCode.length + 1));
                break;
        }

        // If the pin code is 6 digits long, authenticate the user and route them to the home screen of the app
        if (buttonValue.length === 6) {
            try {
                // Get the refresh the token
                const credentials = await AuthenticationService.getCredentials();

                // if the credentials are null, then the user is not authenticated and should be routed to the login screen
                if (!credentials) {
                    setError("Your session has expired. Please restart the app and log in again.");
                    setVisible(true);
                    return;
                }

                const response = await AuthenticationService.fetch("/auth/rotate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Cookie': `refreshToken=${credentials.refreshToken}`,
                    },
                    body: JSON.stringify({"pinCode": buttonValue}),
                })

                if (response.ok) {
                    // Route the user to the home screen of the app
                    props.isAuth(false);

                    // Get the access token from the response
                    const data = await response.json();
                    const accessToken: string = data.accessToken;

                    // Get the refresh token from the cookies
                    const cookies: string | null = response.headers.get('set-cookie');

                    if (cookies == null) {
                      throw new HttpException(
                        500,
                        'Failed to retrieve refresh token from response cookies.'
                      );
                    }

                    // Extract the refresh token from the cookies string
                    const refreshTokenMatch = cookies.match(/refreshToken=([^;]+)/);
                    if (!refreshTokenMatch) {
                      throw new HttpException(
                        500,
                        'Failed to parse refresh token from response cookies.'
                      );
                    }
                    const refreshToken: string = refreshTokenMatch[1];

                    // Store the access token and refresh token securely in the keychain
                    await AuthenticationService.putCredentials(accessToken, refreshToken);
                }
            } catch (e) {
                if (e instanceof HttpException && e.statusCode === 401) {
                    setError("Invalid pin code entered");
                    setVisible(true);
                }
                else {
                    setError("An unknown error occurred during authentication. Please try again later.");
                    setVisible(true);
                }
            }
        }
    }

    return (
        <ScrollView contentContainerStyle={styles(theme).container}>
            <ScrollView contentContainerStyle={passwordAuthScreenStyles(theme).imageContainer}>
                <Image
                    source={require('../../assets/images/Rent-a-Tech-Logo.png')}
                    style={passwordAuthScreenStyles(theme).image}
                />
            </ScrollView>
            <Avatar.Icon
                size={300}
                icon="account-circle"
                style={homeStyles(theme).profileIcon}
                color={theme.redPrimary}
            />
            <Text style={styles(theme).welcomeBackText}>Welcome back, Maggie</Text>
            <View style={styles(theme).bubbleContainer}>
                {pinBubbles.map((isEnabled, index) => (
                    <PinCodeBubble key={index} isEnabled={isEnabled} />
                ))}
            </View>
            {[["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["x", "0", ">"]].map((row, index) => (
                <View key={index} style={styles(theme).buttonContainer}>
                    {row.map((buttonValue, buttonIndex) => (
                        <Text
                            key={buttonIndex}
                            style={styles(theme).button}
                            onPress={() => onButtonPress(buttonValue)}
                        >{buttonValue}</Text>
                    ))}
                </View>
            ))}
            {/** Error message dialog */}
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <Dialog.Title>Error</Dialog.Title>
                    <Dialog.Content>
                        <Text style={passwordAuthScreenStyles(theme).dialogText}>{error}</Text>
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
      )
}