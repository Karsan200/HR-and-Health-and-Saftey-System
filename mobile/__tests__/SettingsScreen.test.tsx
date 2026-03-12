/**
 * @format
 */

import React, { act } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/personal/SettingsScreen';
import { useTheme } from '../src/theme/colourController';
import { DefaultColours } from '../src/theme/colours';
import { StyleSheet } from 'react-native';

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

  it('applies dark theme when dark button is pressed', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Dark'));
    expect(mockUpdateTheme).toHaveBeenCalledWith(
      expect.objectContaining({"amberBackgroundLight": "#9B6302", "amberPrimary": "#E8960A", "amberTextDark": "#FFECCD", "black": "#FFFFFF", "blueDark": "#E6ECF9",
        "blueLight": "#002A80", "bluePrimary": "#588FFF", "greenBackgroundLight": "#0D7B42", "greenPrimary": "#14A45A", "greenTextDark": "#D0EDDE", "greyBackground": "#000000", "greyIconLight": "#F6F6F8", "greyPrimaryMainText": "#ABABB3", "redBackgroundLight": "#AE010B", "redPrimary": "#D20414", "redTextDark": "#F6CDD0", "redTrafficBackgroundLight": "#AE010B", "redTrafficPrimary": "#D20414", "redTrafficTextDark": "#F6CDD0", "white": "#2B2B2B"
      } )
    );
  });

    it('opens the colour picker when background colour is pressed', async () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);

      fireEvent.press(getByText('#F6F6F8')); // press the pressable row, not the label

      await waitFor(() => {
        expect(getByText('Editing background colour')).toBeTruthy();
      });

      expect(getByTestId('mock-color-picker')).toBeTruthy();
    });

    it('highlights the active theme', async () => {
      const { getByTestId } = render(<SettingsScreen />);

      const defaultButton = getByTestId('theme-default-button');
      const flattenStyles = StyleSheet.flatten(defaultButton.props.style);

      expect(flattenStyles).toMatchObject({ borderWidth: 2 });
    });


});