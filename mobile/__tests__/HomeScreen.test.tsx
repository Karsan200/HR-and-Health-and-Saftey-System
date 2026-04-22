import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import AuthenticationService from '../src/logic/AuthenticationService.ts';

jest.mock('react-native-wheel-color-picker', () => {
  return () => null;
});

jest.mock('react-native-paper', () => {
  const mockReact = require('react');
  const { Text, View } = require('react-native');

  jest.mock('../src/logic/AuthenticationService.ts', () => ({
    fetch: jest.fn(),
    putCredentials: jest.fn(),
  }));

  return {
    Avatar: {
      Icon: (props: any) => mockReact.createElement(View, props),
    },
    IconButton: (props: any) =>
        mockReact.createElement(Text, { onPress: props.onPress }, props.icon || 'icon-button'),
  };
});

describe('HomeScreen', () => {
  it('renders welcome text and fetched user name', async () => {
    (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        firstName: 'Maggie',
        lastName: 'May',
      }),
    });

    const { getByText, findByText } = render(
        <HomeScreen
            onSelectHr={() => {}}
            onSelectHealthSafety={() => {}}
            onSelectSettings={() => {}}
            onSelectProfile={() => {}}
            onSelectNotifications={() => {}}
            setIsAuthenticated={jest.fn()}
        />,
    );

    expect(getByText('Welcome Back')).toBeTruthy();

    // wait for async profile fetch
    expect(await findByText('Maggie May')).toBeTruthy();

    expect(getByText('CHOOSE A SECTION')).toBeTruthy();
    expect(getByText('QUICK ACCESS')).toBeTruthy();
  });

  it('renders all buttons', () => {
    const { getByText } = render(
      <HomeScreen
        onSelectHr={() => {}}
        onSelectHealthSafety={() => {}}
        onSelectSettings={() => {}}
        onSelectProfile={() => {}}
        onSelectNotifications={() => {}}
        setIsAuthenticated={jest.fn()}
      />,
    );

    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('presses all buttons to cover functions', () => {
    const { getByText } = render(
      <HomeScreen
        onSelectHr={() => {}}
        onSelectHealthSafety={() => {}}
        onSelectSettings={() => {}}
        onSelectProfile={() => {}}
        onSelectNotifications={() => {}}
        setIsAuthenticated={jest.fn()}
      />,
    );

    fireEvent.press(getByText('HR Portal'));
    fireEvent.press(getByText('Health & Safety'));
    fireEvent.press(getByText('Profile'));
    fireEvent.press(getByText('Notifications'));
    fireEvent.press(getByText('Settings'));
    fireEvent.press(getByText('Logout'));
  });
});
