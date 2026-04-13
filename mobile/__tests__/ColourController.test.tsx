/**
 * @format
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../src/theme/colourController';
import { DefaultColours } from '../src/theme/colours';
import { getSettings } from '../src/logic/SettingsService';
import AuthenticationService from '../src/logic/AuthenticationService';
import SettingsScreen from "../src/screens/personal/SettingsScreen.tsx";

// Mock dependencies
jest.mock('../src/logic/SettingsService', () => ({
  getSettings: jest.fn(),
}));

jest.mock('../src/logic/AuthenticationService', () => ({
  __esModule: true,
  default: {
    extractClaims: jest.fn(),
    fetch: jest.fn(),
  },
}));

jest.mock('../src/screens/personal/SettingsScreen', () => ({
  generateColorSet: jest.fn((hex: string) => ({
    primary: hex,
    dark: '#000000',
    light: '#ffffff',
  })),
}));

// Helper component to read theme context values
function ThemeConsumer({ onRender }: { onRender: (ctx: any) => void }) {
  const ctx = useTheme();
  onRender(ctx);
  return <Text>test</Text>;
}

describe('colourController', () => {

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
    (AuthenticationService.extractClaims as jest.Mock).mockResolvedValue(undefined);
    (getSettings as jest.Mock).mockResolvedValue(defaultSettings);
  });

  // -------------------------------------------------------------------------
  // ThemeContext defaults
  // -------------------------------------------------------------------------

  it('provides default theme and accessibility values without a provider', () => {
    let capturedCtx: any;

    render(<ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />);

    expect(capturedCtx.theme).toEqual(DefaultColours);
    expect(capturedCtx.accessibility).toEqual({
      largeText: false,
      dyslexicFont: false,
      highlightText: false,
    });
  });

  // -------------------------------------------------------------------------
  // ThemeProvider initial render
  // -------------------------------------------------------------------------

  it('renders children inside ThemeProvider', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Text>hello</Text>
      </ThemeProvider>
    );

    expect(getByText('hello')).toBeTruthy();
  });

  it('provides default theme on initial render before settings load', () => {
    // Make getSettings hang so we can check state before it resolves
    (getSettings as jest.Mock).mockReturnValue(new Promise(() => {}));

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    expect(capturedCtx.theme).toEqual(DefaultColours);
    expect(capturedCtx.accessibility).toEqual({
      largeText: false,
      dyslexicFont: false,
      highlightText: false,
    });
  });

  // -------------------------------------------------------------------------
  // Settings loading — theme presets
  // -------------------------------------------------------------------------

  it('applies DEFAULT theme preset on load', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: 'DEFAULT',
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.redPrimary).toBe(DefaultColours.redPrimary);
    });
  });

  it('applies BLUE theme preset on load', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: 'BLUE',
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.redPrimary).toBe('#0066FF');
      expect(capturedCtx.theme.redTextDark).toBe('#003A99');
      expect(capturedCtx.theme.redBackgroundLight).toBe('#DCE8FF');
    });
  });

  it('applies GREEN theme preset on load', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: 'GREEN',
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.redPrimary).toBe('#2E7D32');
      expect(capturedCtx.theme.redTextDark).toBe('#1B5E20');
      expect(capturedCtx.theme.redBackgroundLight).toBe('#C8E6C9');
    });
  });

  it('applies DARK theme preset on load', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: 'DARK',
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.black).toBe('#FFFFFF');
      expect(capturedCtx.theme.white).toBe('#1D1D1D');
      expect(capturedCtx.theme.redPrimary).toBe('#D20413');
      expect(capturedCtx.theme.greyBackground).toBe('#101010');
      expect(capturedCtx.theme.greyPrimaryMainText).toBe('#ABABB3');
    });
  });

  it('applies custom colours when themePreset is null', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: null,
      accentColour: '#FF0000',
      textColour: '#111111',
      backgroundColour: '#222222',
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      // generateColorSet is mocked to return primary: hex, dark: #000000, light: #ffffff
      expect(capturedCtx.theme.redPrimary).toBe('#FF0000');
      expect(capturedCtx.theme.greyBackground).toBe('#222222');
      expect(capturedCtx.theme.greyPrimaryMainText).toBe('#111111');
    });
  });

  it('uses default colour values directly when custom colours match defaults', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: null,
      accentColour: DefaultColours.redPrimary,
      textColour: DefaultColours.black,
      backgroundColour: DefaultColours.greyBackground,
    });

    let capturedCtx: any;

    render(
        <ThemeProvider>
          <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
        </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.redPrimary).toBe(DefaultColours.redPrimary);
      expect(capturedCtx.theme.redTextDark).toBe(DefaultColours.redTextDark);
      expect(capturedCtx.theme.redBackgroundLight).toBe(DefaultColours.redBackgroundLight);
      expect(capturedCtx.theme.black).toBe(DefaultColours.black);
      expect(capturedCtx.theme.greyBackground).toBe(DefaultColours.greyBackground);
    });
  });

  it('generates colour set for custom text colour', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: null,
      accentColour: DefaultColours.redPrimary,
      textColour: '#123456',
      backgroundColour: DefaultColours.greyBackground,
    });

    let capturedCtx: any;

    render(
        <ThemeProvider>
          <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
        </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.black).toBe(DefaultColours.black);
    });
  });


  it('generates colour set for custom background colour', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      themePreset: null,
      accentColour: DefaultColours.redPrimary,
      textColour: DefaultColours.black,
      backgroundColour: '#abcdef',
    });

    let capturedCtx: any;

    render(
        <ThemeProvider>
          <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
        </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.theme.greyBackground).toBe("#abcdef");
    });
  });

  // -------------------------------------------------------------------------
  // Settings loading — accessibility
  // -------------------------------------------------------------------------

  it('applies accessibility settings on load', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      largeText: true,
      dyslexicFont: true,
      highlightText: true,
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.accessibility.largeText).toBe(true);
      expect(capturedCtx.accessibility.dyslexicFont).toBe(true);
      expect(capturedCtx.accessibility.highlightText).toBe(true);
    });
  });

  it('keeps default accessibility when all flags are false', async () => {
    (getSettings as jest.Mock).mockResolvedValue({
      ...defaultSettings,
      largeText: false,
      dyslexicFont: false,
      highlightText: false,
    });

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(capturedCtx.accessibility.largeText).toBe(false);
      expect(capturedCtx.accessibility.dyslexicFont).toBe(false);
      expect(capturedCtx.accessibility.highlightText).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  it('does not crash when extractClaims throws (user not logged in)', async () => {
    (AuthenticationService.extractClaims as jest.Mock).mockRejectedValue(
      new Error('Not authenticated')
    );

    expect(() =>
      render(
        <ThemeProvider>
          <Text>test</Text>
        </ThemeProvider>
      )
    ).not.toThrow();
  });

  it('does not crash when getSettings throws', async () => {
    (getSettings as jest.Mock).mockRejectedValue(new Error('Network error'));

    expect(() =>
      render(
        <ThemeProvider>
          <Text>test</Text>
        </ThemeProvider>
      )
    ).not.toThrow();
  });

  it('keeps default theme when getSettings fails', async () => {
    (getSettings as jest.Mock).mockRejectedValue(new Error('Network error'));

    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    // Give the effect time to run and fail
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(capturedCtx.theme).toEqual(DefaultColours);
  });

  it('logs an error when getSettings fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getSettings as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <ThemeProvider>
        <Text>test</Text>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load settings:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // updateTheme and updateAccessibility
  // -------------------------------------------------------------------------

  it('updateTheme merges partial theme correctly', async () => {
    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    act(() => {
      capturedCtx.updateTheme({ redPrimary: '#AABBCC' });
    });

    expect(capturedCtx.theme.redPrimary).toBe('#AABBCC');
    // Other values should remain unchanged
    expect(capturedCtx.theme.black).toBe(DefaultColours.black);
  });

  it('updateAccessibility merges partial accessibility correctly', async () => {
    let capturedCtx: any;

    render(
      <ThemeProvider>
        <ThemeConsumer onRender={(ctx) => { capturedCtx = ctx; }} />
      </ThemeProvider>
    );

    await waitFor(() => expect(getSettings).toHaveBeenCalled());

    act(() => {
      capturedCtx.updateAccessibility({ largeText: true });
    });

    expect(capturedCtx.accessibility.largeText).toBe(true);
    // Other values should remain unchanged
    expect(capturedCtx.accessibility.dyslexicFont).toBe(false);
    expect(capturedCtx.accessibility.highlightText).toBe(false);
  });

  it('does not call getSettings when extractClaims fails', async () => {
    (AuthenticationService.extractClaims as jest.Mock).mockRejectedValue(
      new Error('Not authenticated')
    );

    render(
      <ThemeProvider>
        <Text>test</Text>
      </ThemeProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(getSettings).not.toHaveBeenCalled();
  });
});