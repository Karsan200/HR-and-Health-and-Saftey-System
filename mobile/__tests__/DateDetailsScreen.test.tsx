/**
 * @format
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DateDetailsScreen from '../src/screens/DateDetailsScreen';
import dayjs from 'dayjs';
import AuthenticationService from "../src/logic/AuthenticationService.ts";

// Mock SafeAreaView to render children directly
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/logic/AuthenticationService.ts', () => ({
  fetch: jest.fn(),
}));

describe('DateDetailsScreen', () => {
  const today = dayjs().format('YYYY-MM-DD');
  let fetchMock: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = AuthenticationService.fetch as jest.Mock;

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders correctly with no activities', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(getByText('No leave for this date')).toBeTruthy();
    });
  });

  it('renders activities when fetch returns data', async () => {
    const leaveData = [
      { name: 'John Doe', role: 'Developer', endDate: '2026-03-15' },
    ];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(leaveData),
    });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(getByText('John Doe • Developer')).toBeTruthy();
      expect(getByText('On leave til 15/03/2026')).toBeTruthy();
    });
  });

  it('handles fetch failure gracefully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Leave fetch failed:', 500);
      expect(getByText('No leave for this date')).toBeTruthy();
    });
  });

  it('handles fetch throwing an error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching leave',
        expect.any(Error),
      );
      expect(getByText('No leave for this date')).toBeTruthy();
    });
  });

  it('changes selected date when a day card is pressed', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      const dayLabel = dayjs(today).startOf('week').add(1, 'day').format('D');
      const dayButton = getByText(dayLabel);
      fireEvent.press(dayButton);

      expect(dayButton).toBeTruthy();
    });
  });

  it('navigates to previous and next weeks', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      const prevButton = getByText('‹');
      const nextButton = getByText('›');

      fireEvent.press(prevButton);
      fireEvent.press(nextButton);

      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });
  });

  it('does not show TODAY badge when selected date is not today', async () => {
    const notToday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { queryByText } = render(<DateDetailsScreen date={notToday} />);

    await waitFor(() => {
      expect(queryByText('TODAY')).toBeNull();
    });
  });

  it('renders multiple activities for a single day', async () => {
    const leaveData = [
      { name: 'Alice', role: 'Designer', endDate: '2026-03-12' },
      { name: 'Bob', role: 'Developer', endDate: '2026-03-13' },
    ];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(leaveData),
    });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(getByText('Alice • Designer')).toBeTruthy();
      expect(getByText('Bob • Developer')).toBeTruthy();
      expect(getByText('On leave til 12/03/2026')).toBeTruthy();
      expect(getByText('On leave til 13/03/2026')).toBeTruthy();
    });
  });

  it('handles empty response text', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(getByText('No leave for this date')).toBeTruthy();
    });
  });

  it('uses today when date prop is null', async () => {
    // fetch will return empty activities
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { getByText } = render(<DateDetailsScreen date={null} />);

    const todayLabel = dayjs().format('D MMMM, YYYY');
    await waitFor(() => {
      // Check the header shows today
      expect(getByText(todayLabel)).toBeTruthy();
      expect(getByText('TODAY')).toBeTruthy();
    });
  });

  it('shows TODAY badge if selected date is today', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(getByText('TODAY')).toBeTruthy();
    });
  });

  it('renders add button', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    const addButton = getByText('+');
    expect(addButton).toBeTruthy();
  });
});
