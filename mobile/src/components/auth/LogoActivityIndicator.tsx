import { ActivityIndicator, Image, View } from 'react-native';
import React, {useContext} from 'react';
import { ThemeContext } from '../../theme/colourController.tsx';

import { logoActivityIndicatorStyles as styles } from './LogoActivityIndicator.styles.ts';

export default function LogoActivityIndicator() {
    const { theme } = useContext(ThemeContext);

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