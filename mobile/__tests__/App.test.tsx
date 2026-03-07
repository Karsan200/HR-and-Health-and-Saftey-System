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

// Mocking react-native-paper components used in the app
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    Icon: (props: any) => React.createElement(Text, props, 'icon'),
    Avatar: {
      Icon: (props: any) => React.createElement(View, props),
    },
    IconButton: (props: any) =>
      React.createElement(Text, { onPress: props.onPress }, props.icon || 'icon-button'),
  };
});

describe('App navigation flow', () => {
  it('starts on the home screen', () => {
    const { getByText, queryByText } = render(<App />);

    // Ensuring the app opens on the HomeScreen by default
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();

    // Ensuring no bottom navigation is shown on the home screen
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Documents')).toBeNull();
  });

  it('opens HR section and shows HR bottom navigation', () => {
    const { getByText, queryByText } = render(<App />);

    // When the HR button is pressed
    fireEvent.press(getByText('HR Portal'));

    // Then the HR bottom navigation items should be visible
    expect(getByText('Payslips')).toBeTruthy();
    expect(getByText('Calendar')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Handbook')).toBeTruthy();
    expect(getByText('Clock-in')).toBeTruthy();

    // Ensuring health and safety items are not shown in the HR section
    expect(queryByText('Documents')).toBeNull();
    expect(queryByText('Overview')).toBeNull();
  });

  it('opens health and safety section and shows health and safety bottom navigation', () => {
    const { getByText, queryByText } = render(<App />);

    // When Health and Safety is pressed
    fireEvent.press(getByText('Health & Safety'));

    // Then the health and safety bottom navigation items should be visible
    expect(getByText('Documents')).toBeTruthy();
    expect(getByText('Risk')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Personal')).toBeTruthy();

    // Ensuring HR items are not shown in the health and safety section
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Handbook')).toBeNull();
  });

  it('returns to the home screen when Home is pressed in the bottom nav', () => {
    const { getByText, queryByText } = render(<App />);

    // Given the user has entered the HR section
    fireEvent.press(getByText('HR Portal'));
    expect(getByText('Calendar')).toBeTruthy();

    // When Home is pressed in the bottom navigation
    fireEvent.press(getByText('Home'));

    // Then the user should be returned to the HomeScreen
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();

    // Ensuring the HR bottom navigation is no longer shown
    expect(queryByText('Payslips')).toBeNull();
    expect(queryByText('Calendar')).toBeNull();
    expect(queryByText('Handbook')).toBeNull();
  });
});
