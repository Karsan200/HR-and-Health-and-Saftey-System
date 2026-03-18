import {Image, ScrollView, Text, View} from 'react-native';
import {Avatar, Button, Dialog, Portal} from 'react-native-paper';
import React, {Dispatch, SetStateAction, useContext, useState} from 'react';
import { ThemeContext } from '../../theme/colourController.tsx';

import { passwordAuthScreenStyles } from './PasswordAuthScreen.styles.ts';
import { homeStyles } from '../HomeScreen.styles.ts';
import { PinCodeAuthScreen as styles } from './PinCodeAuthScreen.styles.ts';
import {PinCodeBubble} from "../../components/auth/PinCodeBubble.tsx";

export function PinCodeAuthScreen(props: { isAuth: Dispatch<SetStateAction<boolean>> }) {
    const [pinCode, setPinCode] = useState('');
    const [pinBubbles, setPinBubbles] = useState([false, false, false, false, false, false]);

    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');

    const { theme } = useContext(ThemeContext)

    function onButtonPress(buttonValue: string) {
        switch(buttonValue) {
            case "x":
                setPinCode(pinCode.slice(0, -1));
                setPinBubbles(pinBubbles.map((_, index) => index < pinCode.length - 1));
                break;
            case ">":
                // This button does not have an actual use, but it can be used to check that
                // the pin code is 6 digits long and display an error message if it is not
                if (pinCode.length !== 6) {
                    setError("Please enter a 6-digit pin code");
                    setVisible(true);
                }
                break;
            default:
                setPinCode(pinCode + buttonValue);
                setPinBubbles(pinBubbles.map((_, index) => index < pinCode.length + 1));
                break;
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