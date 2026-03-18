import { useContext } from 'react';
import { ThemeContext } from '../../theme/colourController.tsx';
import React from 'react';
import { View } from 'react-native';

import { PinCodeBubbleStyles as styles } from './PinCodeBubble.styles.ts';

export function PinCodeBubble(props: { isEnabled: boolean }) {
  const { theme } = useContext(ThemeContext);

  return (
    props.isEnabled ?
      <View style={styles(theme).enabledBubble} />
      :
      <View style={styles(theme).disabledBubble} />
  );
}