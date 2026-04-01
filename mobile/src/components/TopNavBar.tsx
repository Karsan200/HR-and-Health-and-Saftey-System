import React, { useContext } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { topNavStyles as styles } from './TopNavBar.styles';
import { ThemeContext } from "../theme/colourController";


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
  const { theme, accessibility } = useContext(ThemeContext); // get theme from context
  const themedStyles = styles(theme, accessibility);

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.leftSection}>
        {showBackButton && (
          <Pressable style={themedStyles.backButton} onPress={onBackPress}>
            <Icon source="arrow-left" size={24} color={theme.black} />
          </Pressable>
        )}

        <Text style={themedStyles.title}>{title}</Text>
      </View>

      <View style={themedStyles.rightSection}>
        <Pressable style={themedStyles.iconButton} onPress={onNotificationsPress}>
          <View style={themedStyles.notificationWrapper}>
            <Icon source="bell" size={22} color={theme.black} />
            <View style={themedStyles.notificationBadge}>
              <Text style={themedStyles.notificationBadgeText}>1</Text>
            </View>
          </View>
        </Pressable>
        <Pressable style={themedStyles.iconButton} onPress={onProfilePress}>
          <Icon source="account-circle" size={24} color={theme.black} />
        </Pressable>
      </View>

    </View>
  );
}
