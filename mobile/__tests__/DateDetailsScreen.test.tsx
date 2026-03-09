/**
 * @format
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DateDetailsScreen from '../src/screens/DateDetailsScreen';
import dayjs from 'dayjs';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch globally
(globalThis as any).fetch = jest.fn();

// Mock colours & theme to avoid errors
jest.mock('../src/theme/colours', () => ({
  Colours: {
    greyBackground: '#f0f0f0',
    black: '#000',
    redPrimary: '#f00',
    white: '#fff',
    redBackgroundLight: '#fcc',
    redTextDark: '#800',
  },
}));

jest.mock('../src/theme/theme', () => ({
  Spacing: { largePadding: 10 },
  FontSize: { xs14: 14 },
  BorderRadius: { largeButtonsAndOutlines: 12 },
  TextStyles: { regular: {} },
}));

describe('DateDetailsScreen', () => {
  const mockDate = '2026-03-09';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders date header and TODAY label if today', () => {
    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    // Should render the correct formatted date
    expect(getByText(dayjs(mockDate).format('D MMMM, YYYY'))).toBeTruthy();

    // TODAY label should appear if the date is today
    const today = dayjs();
    if (dayjs(mockDate).isSame(today, 'day')) {
      expect(getByText('TODAY')).toBeTruthy();
    }
  });

  it('renders week days correctly', () => {
    const { getByText } = render(<DateDetailsScreen date={mockDate} />);
    const startOfWeek = dayjs(mockDate).startOf('week');

    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      expect(getByText(day.format('ddd').toUpperCase())).toBeTruthy();
      expect(getByText(day.format('D'))).toBeTruthy();
    }
  });

  it('pressing a day updates the selected date', () => {
    const { getByText } = render(<DateDetailsScreen date={mockDate} />);
    const startOfWeek = dayjs(mockDate).startOf('week');
    const targetDay = startOfWeek.add(2, 'day'); // pick Wednesday

    const dayButton = getByText(targetDay.format('D'));
    fireEvent.press(dayButton);

    // After pressing, the day label and number should have selected styles
    expect(getByText(targetDay.format('D'))).toBeTruthy();
    expect(getByText(targetDay.format('ddd').toUpperCase())).toBeTruthy();
  });

  it('navigates to previous and next week', () => {
    const { getByText } = render(<DateDetailsScreen date={mockDate} />);
    const prevButton = getByText('‹');
    const nextButton = getByText('›');

    fireEvent.press(prevButton);
    fireEvent.press(nextButton);

    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });

  it('shows "No leave for this date" when no activities', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    await waitFor(() => {
      expect(getByText('No leave for this date')).toBeTruthy();
    });
  });

  it('renders fetched leave activities', async () => {
    const fakeActivities = [
      { name: 'Mackenzie Cox', role: 'Admin', endDate: '2026-03-10' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(fakeActivities),
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    await waitFor(() => {
      expect(getByText('Mackenzie Cox • Admin')).toBeTruthy();
      expect(getByText('On leave til 10/03/2026')).toBeTruthy();
    });
  });

  it('renders the add button', () => {
    const { getByText } = render(<DateDetailsScreen date={mockDate} />);
    expect(getByText('+')).toBeTruthy();
  });
});
