import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Icon } from 'react-native-paper';
import { FontSize, BorderRadius, TextStyles, Fonts } from '../../theme/theme';
import { ThemeContext } from '../../theme/colourController';

type CardColour = 'red' | 'amber' | 'green' | 'neutral';

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: string;
  colour?: CardColour;
  iconColor?: string; // optional override
  iconBackgroundColor?: string; // optional override
  onPress?: () => void;
  stacked?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
                                                   label,
                                                   value,
                                                   icon,
                                                   colour = 'neutral',
                                                   iconColor,
                                                   iconBackgroundColor,
                                                   onPress,
                                                   stacked = false,
                                                 }) => {
  const { theme, accessibility } = useContext(ThemeContext);
  const Container = onPress ? Pressable : View;
  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  // Colour mapping based on theme
  const colourStyles: Record<CardColour, { iconColor: string; background: string }> = {
    red: {
      iconColor: theme.redPrimary,
      background: theme.redBackgroundLight,
    },
    amber: {
      iconColor: theme.amberPrimary,
      background: theme.amberBackgroundLight,
    },
    green: {
      iconColor: theme.greenPrimary,
      background: theme.greenBackgroundLight,
    },
    neutral: {
      iconColor: theme.bluePrimary,
      background: theme.greyBackground,
    },
  };

  const resolvedIconColor = iconColor ?? colourStyles[colour].iconColor;
  const resolvedBackgroundColor = iconBackgroundColor ?? colourStyles[colour].background;

  // Styles that depend on theme must be inside the component
  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      paddingVertical: 8,
      paddingHorizontal: 10,
      shadowColor: theme.greyIconLight,
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    } as ViewStyle,

    content: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    } as ViewStyle,

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    bottomRow: {
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    iconContainer: {
      width: 20,
      height: 20,
      borderRadius: BorderRadius.smallTextBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 6,
      backgroundColor: resolvedBackgroundColor,
    } as ViewStyle,

    label: {
      ...TextStyles.regular,
      fontSize: FontSize.xs14 * fontScale,
      fontFamily: fontFamilies.regular,
      color: theme.greyIconLight,
    } as TextStyle,

    value: {
      ...TextStyles.regular,
      fontSize: FontSize.l24 * fontScale,
      fontFamily: fontFamilies.regular,
      color: theme.black,
    } as TextStyle,

    topRowStacked: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    iconContainerStacked: {
      marginRight: 0,
    } as ViewStyle,
  });

  return (
    <Container style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={[styles.topRow, stacked && styles.topRowStacked]}>
          {icon && (
            <View style={styles.iconContainer}>
              <Icon source={icon} size={15} color={resolvedIconColor} />
            </View>
          )}
          <Text style={styles.label}>{label}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </Container>
  );
};

export default SummaryCard;