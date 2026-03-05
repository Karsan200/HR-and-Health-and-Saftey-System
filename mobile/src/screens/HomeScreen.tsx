import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { homeStyles as styles } from './HomeScreen.styles.ts';
import { colours } from '../theme/colours'; //getting the colours from the set list

export default function HomeScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/*Profile Image at the top of the page*/}
            <Avatar.Icon
                size={150}
                icon="account-circle"
                style={styles.profileIcon}
                color={colours.redPrimary}
            />

            {/*Welcome message under the profile icon*/}
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>Maggie May</Text>

            <Text style={styles.sectionTitle}>CHOOSE A SECTION</Text>

            {/*On click takes you to the HR Section of the app (Calendar) CURRENTLY BLANK*/}
            <Pressable style={styles.sectionButton} onPress={() => {}}>
                <View style={styles.sectionButtonContent}>
                    <IconButton
                        icon="briefcase-outline"
                        size={35}
                        iconColor={colours.black}
                        containerColor="transparent"
                        style={styles.iconButton}
                    />
                    <Text style={styles.sectionButtonText}>HR Portal</Text>
                </View>
            </Pressable>

            {/*On click takes you to the Health and Safety section of the app (HS Overview) CURRENTLY BLANK*/}
            <Pressable style={styles.sectionButton} onPress={() => {}}>
                <View style={styles.sectionButtonContent}>
                    <IconButton
                        icon="shield-outline"
                        size={35}
                        iconColor={colours.black}
                        containerColor="transparent"
                        style={styles.iconButton}
                    />
                    <Text style={styles.sectionButtonText}>Health &amp; Safety</Text>
                </View>
            </Pressable>

            {/*All quick assess buttons*/}
            <View style={styles.quickAccessContainer}>
                <Text style={styles.quickAccessTitle}>QUICK ACCESS</Text>

                {/*Profile (CURRENTLY BLANK)*/}
                <Pressable style={styles.quickAccessButtonContainer} onPress={() => {}}>
                    <View style={styles.quickAccessButtonContent}>
                        <IconButton
                            icon="account-circle"
                            size={24}
                            iconColor={colours.black}
                            containerColor="transparent"
                            style={styles.iconButton}
                        />
                        <Text style={styles.quickAccessButton}>Profile</Text>
                    </View>
                </Pressable>

                {/*Notifications (CURRENTLY BLANK)*/}
                <Pressable style={styles.quickAccessButtonContainer} onPress={() => {}}>
                    <View style={styles.quickAccessButtonContent}>
                        <IconButton
                            icon="bell-outline"
                            size={24}
                            iconColor={colours.black}
                            containerColor="transparent"
                            style={styles.iconButton}
                        />
                        <Text style={styles.quickAccessButton}>Notifications</Text>
                    </View>
                </Pressable>

                {/*Settings (CURRENTLY BLANK)*/}
                <Pressable style={styles.quickAccessButtonContainer} onPress={() => {}}>
                    <View style={styles.quickAccessButtonContent}>
                        <IconButton
                            icon="cog"
                            size={24}
                            iconColor={colours.black}
                            containerColor="transparent"
                            style={styles.iconButton}
                        />
                        <Text style={styles.quickAccessButton}>Settings</Text>
                    </View>
                </Pressable>

                {/*Logout (CURRENTLY BLANK)*/}
                <Pressable style={styles.quickAccessButtonContainer} onPress={() => {}}>
                    <View style={styles.quickAccessButtonContent}>
                        <IconButton
                            icon="logout"
                            size={24}
                            iconColor={colours.black}
                            containerColor="transparent"
                            style={styles.iconButton}
                        />
                        <Text style={styles.quickAccessButton}>Logout</Text>
                    </View>
                </Pressable>
            </View>
        </ScrollView>
    );
}
