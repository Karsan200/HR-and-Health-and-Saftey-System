/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import ClockInScreen from '../src/screens/ClockInScreen';
import AuthenticationService from '../src/logic/AuthenticationService.ts';

jest.mock('../src/logic/AuthenticationService.ts', () => ({
  fetch: jest.fn(),
}));

// Prevents Jest from choking on JSX in the colour picker node module
jest.mock('react-native-wheel-color-picker', () => {
  const { View } = require('react-native');
  return () => require('react').createElement(View, null);
});

jest.mock('react-native-safe-area-context', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: (props: any) =>
      mockReact.createElement(View, props, props.children),
  };
});

jest.mock('react-native-paper', () => {
  const mockReact = require('react');
  const { Text } = require('react-native');
  return {
    Icon: (props: any) =>
      mockReact.createElement(
        Text,
        { testID: `icon-${props.source}` },
        props.source,
      ),
  };
});

// Default mock status response
const mockStatus = {
  yesterdayClockIn: '08:00',
  yesterdayClockOut: '17:00',
  yesterdayDate: 'Monday, 7 April, 2026',
  totalLates: 2,
  onTimePercent: 90.0,
  avgHoursPerDay: 8.5,
  daysWorked: 20,
};

// Default mock records response
const mockRecords = [
  {
    clockId: 'uuid-1',
    clockInTime: '08:00',
    clockOutTime: '17:00',
    date: 'Monday, 7 April, 2026',
  },
  {
    clockId: 'uuid-2',
    clockInTime: '09:15',
    clockOutTime: '17:30',
    date: 'Tuesday, 8 April, 2026',
  },
];

describe('ClockInScreen', () => {
  let fetchMock: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = AuthenticationService.fetch as jest.Mock;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fetchMock.mockResolvedValue({
      json: async () => mockStatus,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Initial render

  it('shows a loading indicator before data is fetched', () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    const { UNSAFE_getAllByType } = render(<ClockInScreen />);
    const { ActivityIndicator } = require('react-native');

    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('renders yesterday clock-in and clock-out times after fetch', async () => {
    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText('08:00')).toBeTruthy();
      expect(getByText('17:00')).toBeTruthy();
    });
  });

  it('renders yesterday date label', async () => {
    const { getAllByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getAllByText('Monday, 7 April, 2026').length).toBeGreaterThan(0);
    });
  });

  it('renders section labels for yesterday activity', async () => {
    const { getAllByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getAllByText('Yesterday Clock In').length).toBeGreaterThan(0);
      expect(getAllByText('Yesterday Clock Out').length).toBeGreaterThan(0);
    });
  });

  it("renders Yesterday's Activity card title", async () => {
    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText("Yesterday's Activity")).toBeTruthy();
    });
  });

  // Stats grid

  it('renders all four stat card labels', async () => {
    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText('Total Lates')).toBeTruthy();
      expect(getByText('On Time')).toBeTruthy();
      expect(getByText('Days Worked')).toBeTruthy();
      expect(getByText('Avg Hrs/Day')).toBeTruthy();
    });
  });

  it('renders correct stat values from the API response', async () => {
    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText('2')).toBeTruthy();
      expect(getByText('90%')).toBeTruthy();
      expect(getByText('20')).toBeTruthy();
      expect(getByText('8.5')).toBeTruthy();
    });
  });

  // Null/missing data

  it('shows dashes when yesterdayClockIn is null', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ ...mockStatus, yesterdayClockIn: null }),
    });

    const { getAllByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getAllByText('-').length).toBeGreaterThan(0);
    });
  });

  it('shows dashes when yesterdayClockOut is null', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ ...mockStatus, yesterdayClockOut: null }),
    });

    const { getAllByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getAllByText('-').length).toBeGreaterThan(0);
    });
  });

  it('shows dashes when both yesterday times are null', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        ...mockStatus,
        yesterdayClockIn: null,
        yesterdayClockOut: null,
      }),
    });

    const { getAllByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getAllByText('-').length).toBeGreaterThanOrEqual(2);
    });
  });

  // Fetch errors

  it('logs an error when the status fetch fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<ClockInScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching clock status',
        expect.any(Error),
      );
    });
  });

  it('still renders the screen structure after a failed status fetch', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText('Report a Clock-In Issue')).toBeTruthy();
    });
  });

  // Pull to refresh

  it('triggers a status re-fetch when pull-to-refresh is triggered', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockStatus });

    const { UNSAFE_getByType } = render(<ClockInScreen />);

    await waitFor(() => {
      const scrollView = UNSAFE_getByType(ScrollView);
      const refreshControl = scrollView.props.refreshControl;

      act(() => {
        refreshControl.props.onRefresh();
      });
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('sets refreshing to false after pull-to-refresh completes', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockStatus });

    const { UNSAFE_getByType } = render(<ClockInScreen />);

    await waitFor(async () => {
      const scrollView = UNSAFE_getByType(ScrollView);
      const refreshControl = scrollView.props.refreshControl;
      await act(async () => {
        await refreshControl.props.onRefresh();
      });
      expect(refreshControl.props.refreshing).toBe(false);
    });
  });

  // Report button

  it('renders the report button', async () => {
    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText('Report a Clock-In Issue')).toBeTruthy();
    });
  });

  it('opens the report modal when the report button is pressed', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords });

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getByText('Report a Clock-In Issue')).toBeTruthy();
    });

    fireEvent.press(getByText('Report a Clock-In Issue'));

    await waitFor(() => {
      expect(getByText('Report an Issue')).toBeTruthy();
    });
  });

  // Report modal

  it('renders modal subtitle text when modal is open', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords });

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));

    await waitFor(() => {
      expect(
        getByText(/Select the clock-in record you believe is incorrect/),
      ).toBeTruthy();
    });
  });

  it('shows a loading indicator in the modal while records are fetching', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockReturnValueOnce(new Promise(() => {}));

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));

    await waitFor(() => {
      expect(getByText('Report an Issue')).toBeTruthy();
    });
  });

  it('shows "No records found" when records fetch returns empty array', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => [] });

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));

    await waitFor(() => {
      expect(getByText('No records found.')).toBeTruthy();
    });
  });


  it('closes the modal when the close button is pressed', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords });

    const { getByText, queryByText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));
    await waitFor(() => expect(getByText('Report an Issue')).toBeTruthy());

    fireEvent.press(getByText('close'));

    await waitFor(() => {
      expect(queryByText('Report an Issue')).toBeNull();
    });
  });

  it('submit button does not call the API when issue text is empty', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords });

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));

    await waitFor(() => {
      fireEvent.press(getByText('Submit Report'));
    });

    // Only status and records calls — no report POST
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('submits the report and closes the modal on success', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords })
      .mockResolvedValueOnce({ json: async () => ({}) });

    const { getByText, getByPlaceholderText, queryByText } = render(
      <ClockInScreen />,
    );

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));
    await waitFor(() => expect(getByText('Report an Issue')).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText(
        'e.g. I was clocked in late but I arrived on time...',
      ),
      'My clock-in time was wrong.',
    );

    fireEvent.press(getByText('Submit Report'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/clock/report',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(queryByText('Report an Issue')).toBeNull();
    });
  });

  it('shows "Submitting..." text while the report is being submitted', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords })
      .mockReturnValueOnce(new Promise(() => {}));

    const { getByText, getByPlaceholderText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));
    await waitFor(() => expect(getByText('Report an Issue')).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText(
        'e.g. I was clocked in late but I arrived on time...',
      ),
      'My clock-in time was wrong.',
    );

    fireEvent.press(getByText('Submit Report'));

    await waitFor(() => {
      expect(getByText('Submitting...')).toBeTruthy();
    });
  });

  it('logs an error and keeps modal open when report submission fails', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords })
      .mockRejectedValueOnce(new Error('Submit failed'));

    const { getByText, getByPlaceholderText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));
    await waitFor(() => expect(getByText('Report an Issue')).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText(
        'e.g. I was clocked in late but I arrived on time...',
      ),
      'My clock-in time was wrong.',
    );

    fireEvent.press(getByText('Submit Report'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error submitting report',
        expect.any(Error),
      );
    });
  });

  it('logs an error when records fetch fails', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockRejectedValueOnce(new Error('Records fetch failed'));

    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching recent records',
        expect.any(Error),
      );
    });
  });

  it('resets modal state when closed and reopened', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => mockStatus })
      .mockResolvedValueOnce({ json: async () => mockRecords })
      .mockResolvedValueOnce({ json: async () => mockRecords });

    const { getByText, getByPlaceholderText, queryByText } = render(
      <ClockInScreen />,
    );

    await waitFor(() => fireEvent.press(getByText('Report a Clock-In Issue')));
    await waitFor(() => expect(getByText('Report an Issue')).toBeTruthy());

    fireEvent.changeText(
      getByPlaceholderText(
        'e.g. I was clocked in late but I arrived on time...',
      ),
      'Some issue text',
    );

    fireEvent.press(getByText('close'));
    await waitFor(() => expect(queryByText('Report an Issue')).toBeNull());

    fireEvent.press(getByText('Report a Clock-In Issue'));
    await waitFor(() => expect(getByText('Report an Issue')).toBeTruthy());

    const input = getByPlaceholderText(
      'e.g. I was clocked in late but I arrived on time...',
    );
    expect(input.props.value).toBe('');
  });
});
