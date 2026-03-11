import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { topNavStyles as styles } from './TopNavBar.styles';
import { colours } from '../theme/colours';


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
  return (
    // Adding the back button on the far left, if it is required
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable style={styles.backButton} onPress={onBackPress}>
            <Icon source="arrow-left" size={24} color={colours.black} />
          </Pressable>
        )}

        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Adding the notification bell and profile icon on the far right*/}
      <View style={styles.rightSection}>
        <Pressable style={styles.iconButton} onPress={onNotificationsPress}>
          <View style={styles.notificationWrapper}>
            <Icon source="bell" size={22} color={colours.black} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>1</Text>
            </View>
          </View>
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onProfilePress}>
          <Icon source="account-circle" size={24} color={colours.black} />
        </Pressable>
      </View>

    </View>
  );
}
