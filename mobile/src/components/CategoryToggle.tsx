import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../theme/colourController';
import { styles as componentStyles } from './CategoryToggle.styles';

type Option = {
    key: string;
    label: string;
};

type Props = {
    options: Option[];
    selected: string;
    onSelect: (key: string) => void;
    compact?: boolean;
};

export default function CategoryToggle({ options, selected, onSelect, compact }: Props) {
    const { theme, accessibility } = useContext(ThemeContext);
    const styles = componentStyles(theme, accessibility);

    return (
        <View style={styles.container}>
            {options.map(option => (
                <View
                    key={option.key}
                    style={[
                        styles.buttonWrapper,
                        compact && styles.buttonWrapperCompact,
                        selected === option.key && styles.buttonWrapperActive,
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.button,
                            compact && styles.buttonCompact,
                        ]}
                        onPress={() => onSelect(option.key)}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                selected === option.key && styles.buttonTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}