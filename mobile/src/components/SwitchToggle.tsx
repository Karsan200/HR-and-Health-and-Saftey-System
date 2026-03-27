import * as React from 'react';
import { Switch } from 'react-native-paper';

interface SwitchToggleProps {
  value: boolean;
  onToggle: () => void;
  testID?: string;
}

const SwitchToggle = ({ value, onToggle, testID }: SwitchToggleProps) => {
  return <Switch testID={testID} value={value} onValueChange={onToggle} />;
};

export default SwitchToggle;
