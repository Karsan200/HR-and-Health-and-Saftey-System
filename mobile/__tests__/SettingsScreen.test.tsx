/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SettingsScreen, { generateColorSet } from '../src/screens/personal/SettingsScreen';
import { useTheme } from '../src/theme/colourController';
import { DefaultColours } from '../src/theme/colours';
import { StyleSheet } from 'react-native';
import { getSettings, updateSettings } from '../src/logic/SettingsService';

// Mock the useTheme hook
jest.mock('../src/theme/colourController', () => ({
  useTheme: jest.fn(),
}));

// Mock the SettingsService
jest.mock('../src/logic/SettingsService', () => ({
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
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
  const mockUpdateAccessibility = jest.fn();

  const defaultSettings = {
    largeText: false,
    dyslexicFont: false,
    highlightText: false,
    themePreset: 'DEFAULT',
    accentColour: '#D20414',
    textColour: '#000000',
    backgroundColour: '#F6F6F8',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({
      theme: DefaultColours,
      updateTheme: mockUpdateTheme,
      accessibility: {
        largeText: false,
        dyslexicFont: false,
        highlightText: false,
      },
      updateAccessibility: mockUpdateAccessibility,
    });

    (getSettings as jest.Mock).mockResolvedValue(defaultSettings);
    (updateSettings as jest.Mock).mockResolvedValue(undefined);
  });

  // generateColorSet

  it('generateColorSet returns correct color sets', () => {
    generateColorSet("#ff0015");

    expect(generateColorSet("#ff00dd")).toEqual({ primary: "#ff00dd", dark: "#80006e", light: "#f0c2ea" });
    expect(generateColorSet("#0011ff")).toEqual({ primary: "#0011ff", dark: "#000980", light: "#c2c5f0" });
    expect(generateColorSet("#00ff04")).toEqual({ primary: "#00ff04", dark: "#008002", light: "#c2f0c3" });
    expect(generateColorSet("#fff700")).toEqual({ primary: "#fff700", dark: "#807c00", light: "#f0eec2" });
    expect(generateColorSet("#ffffff")).toEqual({ primary: "#ffffff", dark: "#bfbfbf", light: "#fbe9e9" });
    expect(generateColorSet("#380000")).toEqual({ primary: "#380000", dark: "#850000", light: "#bc2f2f" });
    expect(generateColorSet("#040038")).toEqual({ primary: "#040038", dark: "#090085", light: "#392fbc" });
    expect(generateColorSet("#043800")).toEqual({ primary: "#043800", dark: "#098500", light: "#39bc2f" });
    expect(generateColorSet("#4b5e4a")).toEqual({ primary: "#4b5e4a", dark: "#121712", light: "#a8b3a7" });
    expect(generateColorSet("#FF8080")).toEqual({ primary: "#FF8080", dark: "#ff0000", light: "#fee6e6" });
    expect(generateColorSet("#800000")).toEqual({ primary: "#800000", dark: "#cc0000", light: "#d65c5c" });
  });

  // Rendering

  it('renders the main sections', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    expect(getByText('Accessibility Settings')).toBeTruthy();
    expect(getByText('Colour Themes')).toBeTruthy();
    expect(getByText('Background Colour')).toBeTruthy();
    expect(getByText('Text Colour')).toBeTruthy();
    expect(getByText('Accent Colour')).toBeTruthy();
  });

  it('renders accessibility toggles', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    expect(getByText('Dyslexic Font')).toBeTruthy();
    expect(getByText('Large Text')).toBeTruthy();
    expect(getByText('Highlight Text')).toBeTruthy();
  });

  // Theme presets

  it('applies default theme when Default button is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('Default'));
    expect(mockUpdateTheme).toHaveBeenCalledWith(DefaultColours);
  });

  it('applies blue theme when Blue button is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('Blue'));
    expect(mockUpdateTheme).toHaveBeenCalledWith(
      expect.objectContaining({ redPrimary: '#0066FF' })
    );
  });

  it('applies green theme when Green button is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('Green'));
    expect(mockUpdateTheme).toHaveBeenCalledWith(
      expect.objectContaining({ redPrimary: '#2E7D32' })
    );
  });

  it('applies dark theme when Dark button is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('Dark'));
    expect(mockUpdateTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        black: '#FFFFFF',
        white: '#1D1D1D',
        redPrimary: '#D20413',
        greyBackground: '#101010',
      })
    );
  });

  it('highlights the active theme', async () => {
    const { getByTestId } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    const defaultButton = getByTestId('theme-default-button');
    const flattenStyles = StyleSheet.flatten(defaultButton.props.style);
    expect(flattenStyles).toMatchObject({ borderWidth: 2 });
  });

  // Colour picker

  it('opens the colour picker when background colour is pressed', async () => {
    const { getByText, getByTestId } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('#F6F6F8'));

    await waitFor(() => expect(getByText('Editing background colour')).toBeTruthy());
    expect(getByTestId('mock-color-picker')).toBeTruthy();
  });

  it('closes the colour picker when the same colour row is pressed again', async () => {
    const { getByText, queryByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('#F6F6F8'));
    await waitFor(() => expect(getByText('Editing background colour')).toBeTruthy());

    fireEvent.press(getByText('#F6F6F8'));
    await waitFor(() => expect(queryByText('Editing background colour')).toBeNull());
  });

  it('updates the theme when a colour is selected from the colour picker for the background colour', async () => {
    const { getByText, getByTestId } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('#F6F6F8'));
    await waitFor(() => expect(getByText('Editing background colour')).toBeTruthy());

    fireEvent.press(getByTestId('mock-color-picker'));

    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({ greyBackground: '#FF0000' })
      );
    });
  });

  it('updates the theme when a colour is selected from the colour picker for the accent colour', async () => {
    const { getByText, getByTestId } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('#D20414'));
    await waitFor(() => expect(getByText('Editing accent colour')).toBeTruthy());

    fireEvent.press(getByTestId('mock-color-picker'));

    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({ redPrimary: '#FF0000' })
      );
    });
  });

  it('updates the theme when a colour is selected from the colour picker for the text colour', async () => {
    const { getByText, getByTestId } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    fireEvent.press(getByText('#000000'));
    await waitFor(() => expect(getByText('Editing text colour')).toBeTruthy());

    fireEvent.press(getByTestId('mock-color-picker'));

    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          black: '#800000',
          greyPrimaryMainText: '#FF0000',
          greyIconLight: '#f0c2c2',
        })
      );
    });
  });

  // Accessibility toggles

  it('toggles dyslexic font when pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(getByText('Dyslexic Font'));
    });

    expect(mockUpdateAccessibility).toHaveBeenCalledWith({
      "dyslexicFont": true,
      "highlightText": false,
      "largeText": false,
  });
  });

  it('toggles large text when pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(getByText('Large Text'));
    });

    expect(mockUpdateAccessibility).toHaveBeenCalledWith({
      "dyslexicFont": false,
      "highlightText": false,
      "largeText": true,
    });
  });

  it('toggles highlight text and updates theme when pressed', async () => {
    const { getByText } = render(<SettingsScreen />);
    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(getByText('Highlight Text'));
    });

    expect(mockUpdateAccessibility).toHaveBeenCalledWith({
      "dyslexicFont": false,
      "highlightText": true,
      "largeText": false,
    });
    expect(mockUpdateTheme).toHaveBeenCalledWith(
      expect.objectContaining({
        greyPrimaryMainText: '#FFEE00',
        black: '#FFEE00',
      })
    );
  });

  // Settings loading

  it('loads settings on mount and applies default theme preset', async () => {
    render(<SettingsScreen />);
    await waitFor(() => {
      expect(getSettings).toHaveBeenCalled();
      expect(mockUpdateTheme).toHaveBeenCalledWith(DefaultColours);
    });
  });

  it('loads settings on mount and applies blue theme preset', async () => {
    (getSettings as jest.Mock).mockResolvedValue({ ...defaultSettings, themePreset: 'BLUE' });
    render(<SettingsScreen />);
    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({ redPrimary: '#0066FF' })
      );
    });
  });

  it('loads settings on mount and applies green theme preset', async () => {
    (getSettings as jest.Mock).mockResolvedValue({ ...defaultSettings, themePreset: 'GREEN' });
    render(<SettingsScreen />);
    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({ redPrimary: '#2E7D32' })
      );
    });
  });

  it('loads settings on mount and applies dark theme preset', async () => {
    (getSettings as jest.Mock).mockResolvedValue({ ...defaultSettings, themePreset: 'DARK' });
    render(<SettingsScreen />);
    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          redPrimary: '#D20413',
          greyBackground: '#101010',
        })
      );
    });
  });

  it('loads settings on mount and applies custom colours when no preset', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: null,
      accentColour: '#0011ff',
      textColour: '#000000',
      backgroundColour: '#F6F6F8',
    });

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(mockUpdateTheme).toHaveBeenCalledWith(
        expect.objectContaining({ redPrimary: '#0011ff' })
      );
    });
  });

  it('loads accessibility settings on mount', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      largeText: true,
      dyslexicFont: true,
      highlightText: false,
    });

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(mockUpdateAccessibility).toHaveBeenCalledWith(
        expect.objectContaining({
          largeText: true,
          dyslexicFont: true,
          highlightText: false,
        })
      );
    });
  });

  it('calls updateSettings when a theme preset is applied', async () => {
    const { getByText } = render(<SettingsScreen />);

    // Wait for initial load to complete so hasLoaded becomes true
    await waitFor(() => expect(getSettings).toHaveBeenCalled());
    await waitFor(() => expect(mockUpdateTheme).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(getByText('Blue'));
    });

    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ themePreset: 'BLUE' })
      );
    });
  });

  it('does not crash when getSettings fails on mount', async () => {
    (getSettings as jest.Mock).mockRejectedValue(new Error('Network error'));
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });
});