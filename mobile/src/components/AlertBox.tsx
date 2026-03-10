import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colours } from '../theme/colours';
import { BorderRadius, FontSize, TextStyles } from '../theme/theme';

interface AlertBoxProps {
  label?: string;
  // Main body text for the alert
  body?: string;
  // Colour for the small circle
  circleColor?: string;
  // Colour for the label text
  labelColor?: string;
  // Background colour for the label pill
  labelBackground?: string;
  style?: ViewStyle;
}

// AlertBox component renders a small coloured indicator, label pill and body text
const AlertBox: React.FC<AlertBoxProps> = ({
                                             label = 'Document',
                                             body = 'Fire and Safety Policy v2.0 requires a signature',
                                             circleColor = Colours.redPrimary,
                                             labelColor = Colours.redTextDark,
                                             labelBackground = Colours.redBackgroundLight,
                                             style,
                                           }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        {/* Small coloured status circle */}
        <View style={[styles.circle, { backgroundColor: circleColor }]} />
        {/* Label pill displayed next to the circle */}
        <View style={[styles.labelWrap, { backgroundColor: labelBackground }]}>
          <Text style={[styles.labelText, { color: labelColor }]} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
        </View>
      </View>

      {/* Message body text, limited to two lines */}
      <Text style={styles.bodyText} numberOfLines={2}>
        {body}
      </Text>
    </View>
  );
};

export default AlertBox;

const styles = StyleSheet.create({
  // Container for the alert card with elevation and padding
  container: {
    height: 88,
    backgroundColor: Colours.white,
    borderRadius: BorderRadius.largeButtonsAndOutlines,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    // shadow: x=0 y=0 blur=4 with greyIconLight to match figma design
    shadowColor: Colours.greyIconLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  // Row containing the circle and the label pill
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  // Small circular status indicator
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Wrapper for the label pill (background + padding)
  labelWrap: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: BorderRadius.smallTextBackground,
  },
  // Text style for the label inside the pill
  labelText: {
    ...TextStyles.regular,
    fontSize: FontSize.s16,
  },
  // Body text style for the alert message
  bodyText: {
    marginTop: 8,
    ...TextStyles.regular,
    fontSize: FontSize.xxs12,
    color: Colours.black,
  },
});
