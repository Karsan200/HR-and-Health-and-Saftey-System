import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders all main headings', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Maggie May')).toBeTruthy();
    expect(getByText('CHOOSE A SECTION')).toBeTruthy();
    expect(getByText('QUICK ACCESS')).toBeTruthy();
  });

  it('renders all buttons', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('HR Portal')).toBeTruthy();
    expect(getByText('Health & Safety')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('presses all buttons to cover functions', () => {
    const { getByText } = render(<HomeScreen />);

    fireEvent.press(getByText('HR Portal'));
    fireEvent.press(getByText('Health & Safety'));
    fireEvent.press(getByText('Profile'));
    fireEvent.press(getByText('Notifications'));
    fireEvent.press(getByText('Settings'));
    fireEvent.press(getByText('Logout'));
  });
});
