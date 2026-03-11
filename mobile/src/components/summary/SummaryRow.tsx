import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface SummaryRowProps {
  children: React.ReactNode;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ children }) => {
  return <View style={styles.row}>{children}</View>;
};

export default SummaryRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.largePadding,
    marginBottom: theme.spacing.mediumPadding,
    gap: 12,
  },
});
