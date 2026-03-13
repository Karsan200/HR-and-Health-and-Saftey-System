/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen, { generateColorSet } from '../src/screens/personal/SettingsScreen';
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

    it('generateColorSet returns correct color sets', () => {
      generateColorSet("#ff0015")

      expect(generateColorSet("#ff00dd")).toEqual({
        primary: "#ff00dd",
        dark: "#80006e",
        light: "#f0c2ea"
      })

      expect(generateColorSet("#0011ff")).toEqual({
        primary: "#0011ff",
        dark: "#000980",
        light: "#c2c5f0"
      })

      expect(generateColorSet("#00ff04")).toEqual({
        primary: "#00ff04",
        dark: "#008002",
        light: "#c2f0c3"
      })

      expect(generateColorSet("#fff700")).toEqual({
        primary: "#fff700",
        dark: "#807c00",
        light: "#f0eec2"
      })

      expect(generateColorSet("#ffffff")).toEqual({
        primary: "#ffffff",
        dark: "#bfbfbf",
        light: "#fbe9e9"
      })

      expect(generateColorSet("#380000")).toEqual({
        primary: "#380000",
        dark: "#850000",
        light: "#bc2f2f"
      })

      expect(generateColorSet("#040038")).toEqual({
        primary: "#040038",
        dark: "#090085",
        light: "#392fbc"
      })

      expect(generateColorSet("#043800")).toEqual({
        primary: "#043800",
        dark: "#098500",
        light: "#39bc2f"
      })

      expect(generateColorSet("#4b5e4a")).toEqual({
        primary: "#4b5e4a",
        dark: "#121712",
        light: "#a8b3a7"
      })

      expect(generateColorSet("#FF8080")).toEqual({
        primary: "#FF8080",
        dark: "#ff0000",
        light: "#fee6e6"
      })

      expect(generateColorSet("#800000")).toEqual({
        primary: "#800000",
        dark: "#cc0000",
        light: "#d65c5c"
      })
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

    it('colour picker is not viable when the page is first loaded', async () => {
      const { getByText, queryByText  } = render(<SettingsScreen />);

      fireEvent.press(getByText('#F6F6F8')); // Open the colour picker

      fireEvent.press(getByText('#F6F6F8')); // Close the colour picker

      await waitFor(() => {
        expect(queryByText ('Editing background colour')).toBeNull();
      });
    });

    it('updates the theme when a colour is selected from the colour picker for the background colour', async () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);

      fireEvent.press(getByText('#F6F6F8')); // Open the colour picker

      await waitFor(() => {
        expect(getByText('Editing background colour')).toBeTruthy();
      });

      fireEvent.press(getByTestId('mock-color-picker')); // Simulate selecting a colour from the colour picker

      await waitFor(() => {
        expect(mockUpdateTheme).toHaveBeenCalledWith(
          expect.objectContaining({
            greyBackground: '#FF0000', // The new colour selected from the colour picker
          })
        );
      });
    });

    it('updates the theme when a colour is selected from the colour picker for the accent colour', async () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);

      fireEvent.press(getByText('#D20414')); // Open the colour picker for the accent colour

      await waitFor(() => {
        expect(getByText('Editing accent colour')).toBeTruthy();
      });

      fireEvent.press(getByTestId('mock-color-picker')); // Simulate selecting a colour from the colour picker by selected a green colour

      await waitFor(() => {
        expect(mockUpdateTheme).toHaveBeenCalledWith(
          expect.objectContaining({
            redPrimary: '#FF0000', // The new colour selected from the colour picker
          })
        );
      });
    });

    it('updates the theme when a colour is selected from the colour picker for the text colour', async () => {
      const { getByText, getByTestId } = render(<SettingsScreen />);

      fireEvent.press(getByText('#000000')); // Open the colour picker for the text colour

      await waitFor(() => {
        expect(getByText('Editing text colour')).toBeTruthy();
      });

      fireEvent.press(getByTestId('mock-color-picker')); // Simulate selecting a colour from the colour picker

      await waitFor(() => {
        expect(mockUpdateTheme).toHaveBeenCalledWith(
          expect.objectContaining({"black": "#800000", "greyIconLight": "#f0c2c2", "greyPrimaryMainText": "#FF0000"})
        );
      });
    });

    it('highlights the active theme', async () => {
      const { getByTestId } = render(<SettingsScreen />);

      const defaultButton = getByTestId('theme-default-button');
      const flattenStyles = StyleSheet.flatten(defaultButton.props.style);

      expect(flattenStyles).toMatchObject({ borderWidth: 2 });
    });


});