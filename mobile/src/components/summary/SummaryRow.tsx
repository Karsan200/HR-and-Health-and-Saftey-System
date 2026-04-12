import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from "../../theme/theme.ts";
import { ThemeContext } from '../../theme/colourController';

interface SummaryRowProps {
  children: React.ReactNode;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ children }) => {
  const { accessibility } = useContext(ThemeContext);
  const stacked = accessibility.largeText && accessibility.dyslexicFont;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: stacked ? Spacing.smallPadding : Spacing.largePadding,
      marginBottom: Spacing.mediumPadding,
      gap: stacked ? 6 : 12,
    },
  });

  return (
      <View style={styles.row}>
        {React.Children.map(children, child =>
            React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, { stacked })
                : child
        )}
      </View>
  );
};

export default SummaryRow;