/**
 * @format
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DateDetailsScreen from '../src/screens/DateDetailsScreen';
import dayjs from 'dayjs';
import AuthenticationService from '../src/logic/AuthenticationService.ts';

// Mock SafeAreaView to render children directly
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock AuthenticationService
jest.mock('../src/logic/AuthenticationService.ts', () => ({
  fetch: jest.fn(),
}));

// Mocking BookLeaveModal
jest.mock('../src/screens/BookLeaveModal.tsx', () => {
  const { View, Text, TouchableOpacity } = require('react-native');

  return function MockBookLeaveModal(props: any) {
    if (!props.visible) {
      return null;
    }

    return (
      <View>
        <Text>BookLeaveModal</Text>
        <Text>{props.initialDate}</Text>

        <TouchableOpacity onPress={props.onClose}>
          <Text>Close Book Leave Modal</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={props.onSuccess}>
          <Text>Trigger Book Leave Success</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('DateDetailsScreen', () => {
  const today = dayjs().format('YYYY-MM-DD');
  const futureBookableDate = dayjs().add(20, 'day').format('YYYY-MM-DD');
  let fetchMock: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = AuthenticationService.fetch as jest.Mock;
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('renders full day activities when fetch returns data', async () => {
    // Given the leave endpoint returns a full day leave entry
    const leaveData = [
      {
        name: 'John Doe',
        role: 'Developer',
        startDate: '2026-03-15T08:00:00',
        endDate: '2026-03-15T17:00:00',
        partialDay: false,
      },
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

  it('renders partial day activities when fetch returns partial leave data', async () => {
    // Given the leave endpoint returns a partial day leave entry
    const leaveData = [
      {
        name: 'Jane Doe',
        role: 'Technician',
        startDate: '2026-03-15T10:00:00',
        endDate: '2026-03-15T14:30:00',
        partialDay: true,
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(leaveData),
    });

    // When the screen is rendered
    const { getByText } = render(<DateDetailsScreen date={today} />);

    // Then the activity should be shown using the partial day message
    await waitFor(() => {
      expect(getByText('Jane Doe • Technician')).toBeTruthy();
      expect(getByText('On leave 10:00 - 14:30')).toBeTruthy();
    });
  });

  it('renders multiple activities for a single day', async () => {
    // Given the leave endpoint returns multiple leave entries
    const leaveData = [
      {
        name: 'Alice',
        role: 'Designer',
        startDate: '2026-03-12T08:00:00',
        endDate: '2026-03-12T17:00:00',
        partialDay: false,
      },
      {
        name: 'Bob',
        role: 'Developer',
        startDate: '2026-03-13T08:00:00',
        endDate: '2026-03-13T17:00:00',
        partialDay: false,
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(leaveData),
    });

    // When the screen is rendered
    const { getByText } = render(<DateDetailsScreen date={today} />);

    // Then both activities should be shown
    await waitFor(() => {
      expect(getByText('Alice • Designer')).toBeTruthy();
      expect(getByText('Bob • Developer')).toBeTruthy();
      expect(getByText('On leave til 12/03/2026')).toBeTruthy();
      expect(getByText('On leave til 13/03/2026')).toBeTruthy();
    });
  });

  it('handles fetch failure gracefully', async () => {
    // Given the leave endpoint responds with a failed status
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // When the screen is rendered
    const { getByText } = render(<DateDetailsScreen date={today} />);

    // Then the failure should be logged and the empty state should be shown
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

  it('handles empty response text', async () => {
    // Given the leave endpoint returns an empty response body
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '',
    });

    // When the screen is rendered
    const { getByText } = render(<DateDetailsScreen date={today} />);

    // Then the empty state should be shown
    await waitFor(() => {
      expect(getByText('No leave for this date')).toBeTruthy();
    });
  });

  it('uses today when date prop is null', async () => {
    // Given no initial date is supplied and the endpoint returns no leave
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    // When the screen is rendered with a null date prop
    const { getByText } = render(<DateDetailsScreen date={null} />);

    // Then today should be shown in the header and the TODAY badge should be visible
    await waitFor(() => {
      expect(getByText(dayjs().format('D MMMM, YYYY'))).toBeTruthy();
      expect(getByText('TODAY')).toBeTruthy();
    });
  });

  it('shows TODAY badge if selected date is today', async () => {
    // Given the selected date is today
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    // When the screen is rendered
    const { getByText } = render(<DateDetailsScreen date={today} />);

    // Then the TODAY badge should be visible
    await waitFor(() => {
      expect(getByText('TODAY')).toBeTruthy();
    });
  });

  it('does not show TODAY badge when selected date is not today', async () => {
    // Given the selected date is not today
    const notToday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    // When the screen is rendered
    const { queryByText } = render(<DateDetailsScreen date={notToday} />);

    // Then the TODAY badge should not be visible
    await waitFor(() => {
      expect(queryByText('TODAY')).toBeNull();
    });
  });

  it('changes selected date when a day card is pressed', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });


    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

      const dayLabel = dayjs(today).startOf('week').add(1, 'day').format('D');
      const dayButton = getByText(dayLabel);
      fireEvent.press(dayButton);

    await waitFor(() => {
      expect(dayButton).toBeTruthy();
    });
  });

  it('navigates to previous and next weeks', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

      const prevButton = getByText('‹');
      const nextButton = getByText('›');

      fireEvent.press(prevButton);
      fireEvent.press(nextButton);

    await waitFor(() => {
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });
  });

  it('shows the advance booking message when the selected date is too soon', async () => {
    // Given the selected date is within the blocked booking period
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    // When the screen is rendered with a date before the minimum bookable date
    const { getByText, queryByText } = render(<DateDetailsScreen date={today} />);

    // Then the advance booking warning should be shown and the modal should not open
    await waitFor(() => {
      expect(
        getByText('Leave must be booked at least 14 days in advance'),
      ).toBeTruthy();
      expect(queryByText('BookLeaveModal')).toBeNull();
    });

    fireEvent.press(getByText('+'));

    await waitFor(() => {
      expect(queryByText('BookLeaveModal')).toBeNull();
    });
  });

  it('shows the fully booked message when the day already has two leave entries', async () => {
    // Given the selected date is bookable but already fully booked
    const leaveData = [
      {
        name: 'Alice',
        role: 'Designer',
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        partialDay: false,
      },
      {
        name: 'Bob',
        role: 'Developer',
        startDate: '2026-04-20T08:00:00',
        endDate: '2026-04-20T17:00:00',
        partialDay: false,
      },
    ];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(leaveData),
    });

    // When the screen is rendered on a future bookable date
    const { getByText, queryByText } = render(
      <DateDetailsScreen date={futureBookableDate} />,
    );

    // Then the fully booked message should be shown and the modal should not open
    await waitFor(() => {
      expect(getByText('This day is fully booked')).toBeTruthy();
    });

    fireEvent.press(getByText('+'));

    await waitFor(() => {
      expect(queryByText('BookLeaveModal')).toBeNull();
    });
  });

  it('opens the booking modal when the selected day can be booked', async () => {
    // Given the selected date is bookable and has no existing leave entries
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    // When the add button is pressed
    const { getByText } = render(<DateDetailsScreen date={futureBookableDate} />);

    await waitFor(() => {
      expect(getByText('+')).toBeTruthy();
    });

    fireEvent.press(getByText('+'));

    // Then the booking modal should be shown with the selected date passed in
    await waitFor(() => {
      expect(getByText('BookLeaveModal')).toBeTruthy();
      expect(getByText(futureBookableDate)).toBeTruthy();
    });
  });

  it('closes the booking modal when onClose is triggered', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    // When the modal is opened and then closed
    const { getByText, queryByText } = render(
      <DateDetailsScreen date={futureBookableDate} />,
    );

    await waitFor(() => {
      expect(getByText('+')).toBeTruthy();
    });

    fireEvent.press(getByText('+'));

    await waitFor(() => {
      expect(getByText('BookLeaveModal')).toBeTruthy();
    });

    fireEvent.press(getByText('Close Book Leave Modal'));

    await waitFor(() => {
      expect(queryByText('BookLeaveModal')).toBeNull();
    });
  });

  it('refreshes the selected date data when the booking modal success callback runs', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '[]',
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={futureBookableDate} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
  });

    fireEvent.press(getByText('+'));

    await waitFor(() => {
      expect(getByText('BookLeaveModal')).toBeTruthy();
  });

    fireEvent.press(getByText('Trigger Book Leave Success'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(
        `/api/leave/day/${futureBookableDate}`,
      );
    });
  });

  it('renders add button', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: async () => '[]' });

    const { getByText } = render(<DateDetailsScreen date={today} />);

    expect(getByText('+')).toBeTruthy();
  });
});
