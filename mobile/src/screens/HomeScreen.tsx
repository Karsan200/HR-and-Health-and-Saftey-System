import React from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { homeStyles as styles } from './HomeScreen.styles';
import { colours } from '../theme/colours'; //getting the colours from the set list

type HomeScreenProps = {
    onSelectHr: () => void;
    onSelectHealthSafety: () => void;
};

export default function HomeScreen({ onSelectHr, onSelectHealthSafety }: HomeScreenProps) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Icon */}
            <Avatar.Icon
                size={150}
                icon="account-circle"
                style={styles.profileIcon}
                color={colours.redPrimary}
            />

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>Maggie May</Text>

            {/* Section Selection */}
            <Text style={styles.sectionTitle}>CHOOSE A SECTION</Text>

            {/* HR Portal */}
            <Pressable style={styles.sectionButton} onPress={onSelectHr}>
                <View style={styles.sectionButtonContent}>
                    <IconButton
                        icon="briefcase-outline"
                        size={35}
                        iconColor={Colours.black}
                        containerColor="transparent"
                        style={styles.iconButton}
                    />
                    <Text style={styles.sectionButtonText}>HR Portal</Text>
                </View>
            </Pressable>

            {/* Health & Safety */}
            <Pressable style={styles.sectionButton} onPress={onSelectHealthSafety}>
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

            {/* Quick Access Buttons */}
            <View style={styles.quickAccessContainer}>
                <Text style={styles.quickAccessTitle}>QUICK ACCESS</Text>

                <Pressable style={styles.quickAccessButtonContainer} onPress={() => {}}>
                    <View style={styles.quickAccessButtonContent}>
                        <IconButton
                            icon="account-circle"
                            size={24}
                            iconColor={Colours.black}
                            containerColor="transparent"
                            style={styles.iconButton}
                        />
                        <Text style={styles.quickAccessButton}>Profile</Text>
                    </View>
                </Pressable>

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