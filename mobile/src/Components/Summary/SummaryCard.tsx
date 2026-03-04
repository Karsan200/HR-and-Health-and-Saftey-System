import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { Spacing, FontSize, BorderRadius, TextStyles, } from '../../theme/theme';
import { Colours } from '../../theme/colours.ts';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: string; // MaterialCommunityIcons name
  iconColor?: string;
  iconBackgroundColor?: string;
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  iconColor = Colours.bluePrimary,
  iconBackgroundColor = Colours.greyBackground,
  onPress,
}) => {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.card} onPress={onPress}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconBackgroundColor },
          ]}
        >
          <Icon source={icon} size={20} color={iconColor} />
        </View>
      )}

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Container>
  );
};

export default SummaryCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colours.white,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    paddingVertical: Spacing.mediumPadding,
    alignItems: 'center',
    shadowColor: Colours.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.smallPadding,
  },

  label: {
    ...TextStyles.regular,
    fontSize: FontSize.xs14,
    color: Colours.greyIconLight,
    marginBottom: Spacing.smallPadding,
  },

  value: {
    ...TextStyles.medium,
    fontSize: FontSize.l24,
    color: Colours.black,
  },
});
