import { ActivityIndicator, Image, View } from 'react-native';
import React from 'react';
import { useTheme } from '../../theme/colourController.tsx';

import { logoActivityIndicatorStyles } from './LogoActivityIndicator.styles.ts';

export default function LogoActivityIndicator() {
  const { theme } = useTheme();
  const styles = logoActivityIndicatorStyles(theme);

  return (
    <View style={styles.container}>
        <Image
          source={require('../../assets/images/Rent-a-Tech-Logo.png')}
          style={styles.image}
        />
        <ActivityIndicator animating={true} color={theme.redPrimary} size={100}
          style={styles.activityIndicator}
        />
    </View>
  );
}