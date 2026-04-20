import React, { useContext } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Icon } from 'react-native-paper';
import { ThemeContext } from '../theme/colourController';
import { styles as createStyles } from './EyeButton.styles';

type EyeButtonProps = {
    label: string;
    onPress: () => void;
    active: boolean; // true → red, false → grey
    style?: any;
};

export default function EyeButton({ label, onPress, active, style }: EyeButtonProps) {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = createStyles(theme, accessibility);

    return (
        <TouchableOpacity
            style={[styles.button, active ? styles.active : styles.inactive, style]}
            onPress={onPress}
        >
            <Icon source="eye" size={20} color={theme.white} />
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}