/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CalendarScreen from '../src/screens/CalendarScreen';
import AuthenticationService from "../src/logic/AuthenticationService.ts";
import { ScrollView } from 'react-native';

jest.mock('../src/logic/AuthenticationService.ts', () => ({
  fetch: jest.fn(),
}));

// Mock react-native-calendars
jest.mock('react-native-calendars', () => {
  const mockReact = require('react');
  const { Text, TouchableOpacity } = require('react-native');

jest.mock('react-native-wheel-color-picker', () => {
  return () => null;
});

  return {
    Calendar: ({ onDayPress }: any) =>
      mockReact.createElement(
        TouchableOpacity,
        { onPress: () => onDayPress({ dateString: '2026-03-09' }) },
        mockReact.createElement(Text, null, 'Calendar'),
      ),
  };
});

// Mock summary components
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
  let fetchMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = AuthenticationService.fetch as jest.Mock;

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

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

    expect(getByText('Fully Booked')).toBeTruthy();
    expect(getByText('Partially Booked')).toBeTruthy();
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

  it('renders both partial and fully booked days correctly', async () => {
    // Simulate two leaves on same day to trigger fullyBooked
    fetchMock.mockResolvedValueOnce({
      json: async () => [
        { startDate: '2026-03-09', endDate: '2026-03-09' }, // 1 booking
        { startDate: '2026-03-09', endDate: '2026-03-09' }, // 2nd booking → fully booked
        { startDate: '2026-03-10', endDate: '2026-03-10' }, // single booking → partial
      ],
    });

    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);

    await waitFor(() => {
      // These checks ensure the key is still visible
      expect(getByText('Fully Booked')).toBeTruthy();
      expect(getByText('Partially Booked')).toBeTruthy();
    });
  });

  it('handles empty fetch result', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => [] });

    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);
    await waitFor(() => {
      expect(getByText('Fully Booked')).toBeTruthy();
      expect(getByText('Partially Booked')).toBeTruthy();
    });
  });

  it('handles single-day leave correctly (partial booking branch)', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => [{ startDate: '2026-03-09', endDate: '2026-03-09' }],
    });

    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);
    await waitFor(() => {
      expect(getByText('Partially Booked')).toBeTruthy();
    });
  });

  it('handles multi-day leave correctly (fully booked branch)', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => [
        { startDate: '2026-03-09', endDate: '2026-03-10' }, // 2 days = MaxBookedDays
      ],
    });

    const { getByText } = render(<CalendarScreen onDayPress={() => {}} />);
    await waitFor(() => {
      expect(getByText('Fully Booked')).toBeTruthy();
    });
  });

  it('handles invalid leave range gracefully (startDate > endDate)', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => [{ startDate: '2026-03-10', endDate: '2026-03-09' }],
    });

    render(<CalendarScreen onDayPress={() => {}} />);
    // The while loop branch is skipped
  });

  it('handles fetch rejection (network error) correctly', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));
    render(<CalendarScreen onDayPress={() => {}} />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching leave',
        expect.any(Error),
      );
    });
  });

  it('triggers data refresh when onRefresh is called', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => [] }) // initial fetchLeave
      .mockResolvedValueOnce({
        json: async () => ({ totalDays: 0, pendingCount: 0, approvedCount: 0 }),
      }) // initial fetchSummary
      .mockResolvedValueOnce({ json: async () => [] }) // refresh fetchLeave
      .mockResolvedValueOnce({
        json: async () => ({ totalDays: 0, pendingCount: 0, approvedCount: 0 }),
      }); // refresh fetchSummary

    const { UNSAFE_getByType } = render(
      <CalendarScreen onDayPress={() => {}} />,
    );

    // Access the ScrollView and its props
    const scrollView = UNSAFE_getByType(ScrollView);
    const refreshControl = scrollView.props.refreshControl;

    // Simulate pull-to-refresh by calling the onRefresh prop
    await waitFor(async () => {
      await refreshControl.props.onRefresh();
    });

    // Ensure both API endpoints were called twice (initial + refresh)
    expect(fetchMock).toHaveBeenCalledTimes(4);

    // Check that refreshing prop is false after refresh completes
    expect(refreshControl.props.refreshing).toBe(false);
  });

});
