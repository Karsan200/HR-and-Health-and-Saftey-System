/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../App.tsx';

// Mocking safe area to prevent errors with missing native modules
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../src/theme/paperTheme', () => ({
  paperTheme: {},
}));

// Mocking react-native-paper components used in the app
jest.mock('react-native-paper', () => {
  const mockReact = require('react');
  const { Text, View } = require('react-native');

  return {
    PaperProvider: ({ children }: { children: React.ReactNode }) => children,
    Icon: (props: any) => mockReact.createElement(Text, props, props.source || 'icon'),
    Avatar: {
      Icon: (props: any) => mockReact.createElement(View, props),
    },
    IconButton: (props: any) =>
        mockReact.createElement(Text, { onPress: props.onPress }, props.icon || 'icon-button'),
  };
});

// Mock CalendarScreen to just render a placeholder
jest.mock('../src/screens/CalendarScreen', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');

  return () => mockReact.createElement(View, null, mockReact.createElement(Text, null, 'Calendar'));
});

describe('App navigation flow', () => {
  it('starts on the home screen', () => {
    const { getByText, queryByText } = render(<App />);

    // Ensuring the app opens on the HomeScreen by default
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();

    // Ensuring portal navigation labels are not shown on the home screen
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Documents')).toBeNull();
  });

  it('opens HR section and shows the HR top and bottom navigation', () => {
    const { getByText, getAllByText, queryByText } = render(<App />);

    // When the HR button is pressed
    fireEvent.press(getByText('HR Portal'));

    // Then the word calendar should appear in the top navbar and bottom navbar
    expect(getAllByText('Calendar')).toHaveLength(3);

    // Then the HR top navigation icons should be visible
    expect(getByText('bell')).toBeTruthy();

    // Then the HR bottom navigation items should be visible
    expect(getByText('Payslips')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Handbook')).toBeTruthy();
    expect(getByText('Clock-in')).toBeTruthy();

    // Ensuring health and safety items are not shown in the HR section
    expect(queryByText('Documents')).toBeNull();
    expect(queryByText('Overview')).toBeNull();
  });

  it('opens health and safety section and shows the health and safety top and bottom navigation', () => {
    const { getByText, getAllByText, queryByText } = render(<App />);

    // When Health and Safety is pressed
    fireEvent.press(getByText('Health & Safety'));

    // Then Overview should appear in both the top nav and bottom nav
    expect(getAllByText('Overview')).toHaveLength(2);

    // Then the health and safety top navigation icons should be visible
    expect(getByText('bell')).toBeTruthy();

    // Then the health and safety bottom navigation items should be visible
    expect(getByText('Documents')).toBeTruthy();
    expect(getByText('Risk')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Personal')).toBeTruthy();

    // Ensuring HR items are not shown in the health and safety section
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Handbook')).toBeNull();
  });

  it('returns to the home screen when Home is pressed in the bottom nav', () => {
    const { getByText, getAllByText, queryByText } = render(<App />);

    // Given the user has entered the HR section
    fireEvent.press(getByText('HR Portal'));
    expect(getAllByText('Calendar')).toHaveLength(3);

    // When Home is pressed in the bottom navigation
    fireEvent.press(getByText('Home'));

    // Then the user should be returned to the HomeScreen
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();

    // Ensuring the portal navigation is no longer shown
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Calendar')).toBeNull();
    expect(queryByText('Handbook')).toBeNull();
    expect(queryByText('Documents')).toBeNull();
  });
});
