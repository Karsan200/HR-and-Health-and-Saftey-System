import React, { useContext } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { bottomNavStyles as styles } from './BottomNavBar.styles';
import { ThemeContext } from '../theme/colourController';
import { AppSection, ScreenKey, getBottomNavItems } from '../logic/NavigationConfiguration.ts';

type BottomNavBarProps = {
  section: AppSection;
  currentScreen: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
};

export default function BottomNavBar({
                                       section, currentScreen, onNavigate
                                     }: BottomNavBarProps) {
  const { theme } = useContext(ThemeContext); // get dynamic theme
  const items = getBottomNavItems(section);

  // Hide the bottom navbar if not needed
  if (!section || items.length === 0 || currentScreen === 'home') {
    return null;
  }

  return (
    <View style={styles(theme).container}>
      {items.map(item => {
        const isActive = item.key === currentScreen;

        return (
          <Pressable
            key={item.key}
            style={styles(theme).navItem}
            onPress={() => onNavigate(item.key)}
          >
            <Icon
              source={item.icon}
              size={40}
              color={isActive ? theme.redPrimary : theme.greyIconLight}
            />
            <Text
              style={[styles(theme).navLabel, isActive && styles(theme).activeNavLabel]}
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

