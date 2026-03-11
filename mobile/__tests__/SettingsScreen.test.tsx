/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/personal/SettingsScreen';
import { useTheme } from '../src/theme/colourController';
import { DefaultColours } from '../src/theme/colours';

// Mock the useTheme hook
jest.mock('../src/theme/colourController', () => ({
    useTheme: jest.fn(),
}));

// Mock react-native-wheel-color-picker to avoid native dependency
jest.mock('react-native-wheel-color-picker', () => {
    const { View, Text } = require('react-native');

    return ({ color, onColorChangeComplete }: any) => (
        <View>
            <Text>MockColorPicker</Text>
            <Text testID="mock-color-picker" onPress={() => onColorChangeComplete('#FF0000')}>
                {color}
            </Text>
        </View>
    );
});

describe('SettingsScreen', () => {
    const mockUpdateTheme = jest.fn();

    beforeEach(() => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: DefaultColours,
            updateTheme: mockUpdateTheme,
        });
        jest.clearAllMocks();
    });

    it('renders the main sections', () => {
        const { getByText } = render(<SettingsScreen />);
        expect(getByText('Accessibility Settings')).toBeTruthy();
        expect(getByText('Colour Themes')).toBeTruthy();
        expect(getByText('Background Colour')).toBeTruthy();
        expect(getByText('Text Colour')).toBeTruthy();
        expect(getByText('Accent Colour')).toBeTruthy();
    });

    it('applies default theme when Default button is pressed', () => {
        const { getByText } = render(<SettingsScreen />);
        fireEvent.press(getByText('Default'));
        expect(mockUpdateTheme).toHaveBeenCalledWith(DefaultColours);
    });

    it('applies blue theme when Blue button is pressed', () => {
        const { getByText } = render(<SettingsScreen />);
        fireEvent.press(getByText('Blue'));
        expect(mockUpdateTheme).toHaveBeenCalledWith(
            expect.objectContaining({
                redPrimary: '#0066FF',
            })
        );
    });

    it('applies green theme when Green button is pressed', () => {
        const { getByText } = render(<SettingsScreen />);
        fireEvent.press(getByText('Green'));
        expect(mockUpdateTheme).toHaveBeenCalledWith(
            expect.objectContaining({
                redPrimary: '#2E7D32',
            })
        );
    });

    // it('opens the colour picker when background colour is pressed', async () => {
    //     const { getByText, findByText, getByTestId } = render(<SettingsScreen />);
    //
    //     // Use act to ensure state updates flush
    //     await act(async () => {
    //         fireEvent.press(getByText('Background Colour'));
    //     });
    //
    //     // findByText waits for the element to appear
    //     const pickerHeader = await findByText('Editing background colour');
    //     expect(pickerHeader).toBeTruthy();
    //
    //     // Confirm the color picker component is visible
    //     expect(getByTestId('mock-color-picker')).toBeTruthy();
    // });
    //
    // it('highlights the active theme', () => {
    //     const { getAllByText } = render(<SettingsScreen />);
    //
    //     const defaultPressables = getAllByText('Default');
    //     const defaultButton = defaultPressables[0].parent;
    //
    //     // Flatten styles
    //     const flattenStyles = defaultButton?.props.style.flat ? defaultButton.props.style.flat() : defaultButton?.props.style;
    //
    //     expect(flattenStyles).toEqual(
    //         expect.arrayContaining([expect.objectContaining({ borderWidth: 2 })])
    //     );
    // });
});