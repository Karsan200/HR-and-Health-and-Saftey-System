import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from "../../theme/theme.ts";

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
    paddingHorizontal: Spacing.largePadding,
    marginBottom: Spacing.mediumPadding,
    gap: 12,
  },
});
