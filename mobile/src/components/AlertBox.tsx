import React, { useContext } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContext } from '../theme/colourController';
import { BorderRadius, Fonts, FontSize, TextStyles } from '../theme/theme';

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
  const { theme, accessibility } = useContext(ThemeContext); // get theme dynamically
  const themedStyles = styles(theme, accessibility);
  

  return (
    <View style={[themedStyles.container, style]}>
      <View style={themedStyles.topRow}>
        <View
          style={[
            themedStyles.circle,
            { backgroundColor: circleColor || theme.redPrimary },
          ]}
        />
        <View
          style={[
            themedStyles.labelWrap,
            { backgroundColor: labelBackground || theme.redBackgroundLight },
          ]}
        >
          <Text
            style={[
              themedStyles.labelText,
              { color: labelColor || theme.redTextDark },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
        </View>
      </View>

      <Text style={themedStyles.bodyText} numberOfLines={2}>
        {body}
      </Text>
    </View>
  );
};

export default AlertBox;

const styles = (theme: any, accessibility: { largeText: boolean, dyslexicFont: boolean }) => {

  const fontScale = accessibility.largeText ? 1.3 : 1;
  const fontFamilies = accessibility.dyslexicFont ? Fonts.dyslexic : Fonts.poppins;

  return StyleSheet.create({
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
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.s16 * fontScale,
    },
    bodyText: {
      marginTop: 8,
      fontFamily: fontFamilies.regular,
      fontWeight: TextStyles.medium.fontWeight,
      fontSize: FontSize.xxs12 * fontScale,
      color: theme.black,
    },
  });
};