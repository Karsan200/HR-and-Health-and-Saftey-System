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
  const { theme, accessibility } = useContext(ThemeContext); // get theme from context
  const themedStyles = styles(theme, accessibility);
  const items = getBottomNavItems(section);

  // Hide the bottom navbar if not needed
  if (!section || items.length === 0 || currentScreen === 'home') {
    return null;
  }

  return (
    <View style={themedStyles.container}>
      {items.map(item => {
        const isActive = item.key === currentScreen;

        return (
          <Pressable
            key={item.key}
            style={themedStyles.navItem}
            onPress={() => onNavigate(item.key)}
          >
            <Icon
              source={item.icon}
              size={40}
              color={isActive ? theme.redPrimary : theme.greyIconLight}
            />
            <Text
              style={[themedStyles.navLabel, isActive && themedStyles.activeNavLabel]}
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

