import React, { useContext } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContext } from '../theme/colourController';
import { BorderRadius, FontSize, TextStyles } from '../theme/theme';

interface AlertBoxProps {
  label?: string;
  body?: string;
  circleColor?: string;
  labelColor?: string;
  labelBackground?: string;
  style?: ViewStyle;
}

const AlertBox: React.FC<AlertBoxProps> = ({
                                             label = 'Document',
                                             body = 'Fire and Safety Policy v2.0 requires a signature',
                                             circleColor,
                                             labelColor,
                                             labelBackground,
                                             style,
                                           }) => {
  const { theme } = useContext(ThemeContext); // get theme dynamically

  return (
    <View style={[styles(theme).container, style]}>
      <View style={styles(theme).topRow}>
        <View
          style={[
            styles(theme).circle,
            { backgroundColor: circleColor || theme.redPrimary },
          ]}
        />
        <View
          style={[
            styles(theme).labelWrap,
            { backgroundColor: labelBackground || theme.redBackgroundLight },
          ]}
        >
          <Text
            style={[
              styles(theme).labelText,
              { color: labelColor || theme.redTextDark },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
        </View>
      </View>

      <Text style={styles(theme).bodyText} numberOfLines={2}>
        {body}
      </Text>
    </View>
  );
};

export default AlertBox;

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      height: 88,
      backgroundColor: theme.white,
      borderRadius: BorderRadius.largeButtonsAndOutlines,
      paddingHorizontal: 10,
      paddingVertical: 10,
      justifyContent: 'center',
      shadowColor: theme.greyIconLight,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
    },
    circle: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    labelWrap: {
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 0,
      borderRadius: BorderRadius.smallTextBackground,
    },
    labelText: {
      ...TextStyles.regular,
      fontSize: FontSize.s16,
    },
    bodyText: {
      marginTop: 8,
      ...TextStyles.regular,
      fontSize: FontSize.xxs12,
      color: theme.black,
    },
  });
