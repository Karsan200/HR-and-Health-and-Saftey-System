/**
 * @format
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CalendarScreen from '../src/screens/CalendarScreen';

// Mocking react-native-calendars
jest.mock('react-native-calendars', () => {
  const mockReact = require('react');
  const { Text, TouchableOpacity } = require('react-native');

  return {
    Calendar: ({ onDayPress }: any) =>
      mockReact.createElement(
        TouchableOpacity,
        { onPress: () => onDayPress({ dateString: '2026-03-09' }) },
        mockReact.createElement(Text, null, 'Calendar')
      ),
  };
});

// Mocking summary components
jest.mock('../src/components/summary/SummaryCard', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  return (props: any) =>
    mockReact.createElement(
      View,
      null,
      mockReact.createElement(Text, null, props.label || 'SummaryCard'),
    );
});

jest.mock('../src/components/summary/SummaryRow', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return (props: any) => mockReact.createElement(View, null, props.children);
});

describe('CalendarScreen', () => {
  it('renders summary cards', () => {
    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);

    expect(getByText('Hours')).toBeTruthy();
    expect(getByText('Pending')).toBeTruthy();
    expect(getByText('Approved')).toBeTruthy();
  });

  it('renders the calendar', () => {
    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);

    // Renders the mocked calendar
    expect(getByText('Calendar')).toBeTruthy();
  });

  it('renders the key for booked days', () => {
    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);

    expect(getByText('Fully Booked Days')).toBeTruthy();
    expect(getByText('Partial Booked Days')).toBeTruthy();
  });

  it('calls onDayPress when a day is pressed', () => {
    const onDayPressMock = jest.fn();

    // Render the screen
    const { getByText } = render(
      <CalendarScreen onDayPress={onDayPressMock} />,
    );

    // Simulate pressing the mocked calendar
    fireEvent.press(getByText('Calendar'));

    // The mocked calendar doesn't actually pass a date, so just checking the function can be called
    expect(onDayPressMock).toHaveBeenCalledTimes(1);
  });
});
