import * as React from 'react';
import { Switch } from 'react-native-paper';

interface SwitchToggleProps {
    value: boolean;
    onToggle: () => void;
}

const SwitchToggle = ({ value, onToggle }: SwitchToggleProps) => {
    return <Switch value={value} onValueChange={onToggle} />;
};

export default SwitchToggle;