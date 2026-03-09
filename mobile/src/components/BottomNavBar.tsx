import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { bottomNavStyles as styles } from './BottomNavBar.styles';
import { colours } from '../theme/colours';
import {AppSection, ScreenKey, getBottomNavItems } from '../logic/NavigationConfiguration.ts';

type BottomNavBarProps = {
  section: AppSection;
  currentScreen: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
};

export default function BottomNavBar({
 section, currentScreen, onNavigate
}: BottomNavBarProps) {
  const items = getBottomNavItems(section);

  // Ensuring the bottom navbar is not present when it is not needed
  if (!section || items.length === 0 || currentScreen === 'home') {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map(item => {
        const isActive = item.key === currentScreen;

        // Returning the bottom navbar with the icons and labels
        return (
          <Pressable
            key={item.key}
            style={styles.navItem}
            onPress={() => onNavigate(item.key)}
          >
            <Icon
              source={item.icon}
              size={40}
              color={isActive ? colours.redPrimary : colours.greyIconLight}
            />
            <Text
                style={[styles.navLabel, isActive && styles.activeNavLabel]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


/*
Learning resource used:
https://reactnavigation.org/docs/bottom-tab-navigator/
*/

