import React, { useContext } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { topNavStyles as styles } from './TopNavBar.styles';
import { Colours } from '../theme/colours';


type TopNavBarProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
};

export default function TopNavBar({
                                    title,
                                    showBackButton = false,
                                    onBackPress,
                                    onNotificationsPress,
                                    onProfilePress,
                                  }: TopNavBarProps) {
  const { theme } = useContext(ThemeContext); // get theme from context

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).leftSection}>
        {showBackButton && (
          <Pressable style={styles(theme).backButton} onPress={onBackPress}>
            <Icon source="arrow-left" size={24} color={theme.black} />
          </Pressable>
        )}

        <Text style={styles(theme).title}>{title}</Text>
      </View>

      <View style={styles(theme).rightSection}>
        <Pressable style={styles(theme).iconButton} onPress={onNotificationsPress}>
          <View style={styles(theme).notificationWrapper}>
            <Icon source="bell" size={22} color={theme.black} />
            <View style={styles(theme).notificationBadge}>
              <Text style={styles(theme).notificationBadgeText}>1</Text>
            </View>
          </View>
        </Pressable>
        <Pressable style={styles(theme).iconButton} onPress={onProfilePress}>
          <Icon source="account-circle" size={24} color={theme.black} />
        </Pressable>
      </View>

    </View>
  );
}
