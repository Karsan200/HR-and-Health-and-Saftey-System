import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../theme/colourController';
import { styles as pillStyles } from './FilterPills.styles';

type FilterOption<T extends string> = {
    key: T;
    label: string;
};

type Props<T extends string> = {
    options: FilterOption<T>[];
    selected: T;
    onSelect: (value: T) => void;
    style?: any;
};

export default function FilterPills<T extends string>({
                                                          options,
                                                          selected,
                                                          onSelect,
                                                          style,
                                                      }: Props<T>) {

    const { theme, accessibility } = useContext(ThemeContext);
    const styles = pillStyles(theme, accessibility);

    return (
        <View style={[styles.container, style]}>
            {options.map(({ key, label }) => {

                const active = selected === key;

                return (
                    <TouchableOpacity
                        key={key}
                        style={[
                            styles.pill,
                            active && styles.pillActive,
                        ]}
                        onPress={() => onSelect(key)}
                    >
                        <Text
                            style={[
                                styles.text,
                                active && styles.textActive,
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}