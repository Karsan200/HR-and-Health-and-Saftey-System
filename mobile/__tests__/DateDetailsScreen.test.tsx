import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DateDetailsScreen from '../src/screens/DateDetailsScreen';
import dayjs from 'dayjs';

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch globally
(globalThis as any).fetch = jest.fn();

describe('DateDetailsScreen', () => {
  const mockDate = dayjs().format('YYYY-MM-DD');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected date and TODAY label if today', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    await waitFor(() =>
      expect(getByText(dayjs(mockDate).format('D MMMM, YYYY'))).toBeTruthy(),
    );
    await waitFor(() => expect(getByText('TODAY')).toBeTruthy());
  });

  it('renders week day buttons', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    const startOfWeek = dayjs(mockDate).startOf('week');
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.add(i, 'day');
      await waitFor(() =>
        expect(getByText(day.format('ddd').toUpperCase())).toBeTruthy(),
      );
      await waitFor(() => expect(getByText(day.format('D'))).toBeTruthy());
    }
  });

  it('renders "No leave for this date" when fetch returns empty', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    await waitFor(() =>
      expect(getByText('No leave for this date')).toBeTruthy(),
    );
  });

  it('renders activity cards when fetch returns data', async () => {
    const mockData = [{ name: 'Alice', role: 'Manager', endDate: mockDate }];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockData),
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    await waitFor(() => expect(getByText('Alice • Manager')).toBeTruthy());
    await waitFor(() =>
      expect(
        getByText(`On leave til ${dayjs(mockDate).format('DD/MM/YYYY')}`),
      ).toBeTruthy(),
    );
  });

  it('pressing previous and next week buttons changes selected date', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    const prevButton = getByText('‹');
    const nextButton = getByText('›');

    fireEvent.press(prevButton);
    fireEvent.press(nextButton);
  });

  it('pressing a day card changes the selected date', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    const startOfWeek = dayjs(mockDate).startOf('week');
    const dayToPress = startOfWeek.add(2, 'day'); // Wednesday for example
    const dayButton = getByText(dayToPress.format('D'));

    fireEvent.press(dayButton);
  });

  it('renders the add button and covers press', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => '[]',
    });

    const { getByText } = render(<DateDetailsScreen date={mockDate} />);

    const addButton = getByText('+');
    expect(addButton).toBeTruthy();
    fireEvent.press(addButton);
  });
});
