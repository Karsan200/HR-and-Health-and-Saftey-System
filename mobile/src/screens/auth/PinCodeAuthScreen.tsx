import {Image, ScrollView, Text, View} from 'react-native';
import { Avatar } from 'react-native-paper';
import React, {Dispatch, SetStateAction, useContext, useState} from 'react';
import { ThemeContext } from '../../theme/colourController.tsx';

import { passwordAuthScreenStyles } from './PasswordAuthScreen.styles.ts';
import { homeStyles } from '../HomeScreen.styles.ts';
import { PinCodeAuthScreen as styles } from './PinCodeAuthScreen.styles.ts';
import {PinCodeBubble} from "../../components/auth/PinCodeBubble.tsx";

export function PinCodeAuthScreen(props: { isAuth: Dispatch<SetStateAction<boolean>> }) {
    const [pinCode, setPinCode] = useState('');
    const [pinBubbles, setPinBubbles] = useState([false, false, false, false, false, false]);

    const { theme } = useContext(ThemeContext)

      return (
        <ScrollView contentContainerStyle={passwordAuthScreenStyles(theme).container}>
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
        </ScrollView>
      )
}