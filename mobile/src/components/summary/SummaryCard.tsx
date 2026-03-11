import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon } from 'react-native-paper';
import { theme } from '../../theme/theme';
import { colours } from '../../theme/colours';

type CardColour = 'red' | 'amber' | 'green' | 'neutral';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: string;
  colour?: CardColour;
  iconColor?: string; // optional override
  iconBackgroundColor?: string; // optional override
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
                                                   label,
                                                   value,
                                                   icon,
                                                   colour = 'neutral',
                                                   iconColor,
                                                   iconBackgroundColor,
                                                   onPress,
                                                 }) => {
  const Container = onPress ? Pressable : View;

  // Colour mapping
  const colourStyles = {
    red: {
      iconColor: colours.redPrimary,
      background: colours.redBackgroundLight,
    },
    amber: {
      iconColor: colours.amberPrimary,
      background: colours.amberBackgroundLight,
    },
    green: {
      iconColor: colours.greenPrimary,
      background: colours.greenBackgroundLight,
    },
    neutral: {
      iconColor: colours.bluePrimary,
      background: colours.greyBackground,
    },
  };

  const resolvedIconColor = iconColor ?? colourStyles[colour].iconColor;

  const resolvedBackgroundColor =
    iconBackgroundColor ?? colourStyles[colour].background;

  return (
    <Container style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        {/* Top Row → Icon + Label */}
        <View style={styles.topRow}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: resolvedBackgroundColor },
              ]}
            >
              <Icon source={icon} size={15} color={resolvedIconColor} />
            </View>
          )}

          <Text style={styles.label}>{label}</Text>
        </View>

        {/* Bottom Row → Value */}
        <View style={styles.bottomRow}>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </Container>
  );
};

export default SummaryCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colours.white,
    borderRadius: theme.borderRadius.largeButtonsAndOutlines,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: colours.greyIconLight,
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.smallTextBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  label: {
    ...theme.textStyles.regular,
    fontSize: theme.fontSize.xs14,
    color: colours.greyIconLight,
  },

  value: {
    ...theme.textStyles.regular,
    fontSize: theme.fontSize.l24,
    color: colours.black,
  },
});
