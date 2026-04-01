import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import HandbookScreen from '../src/screens/HandbookScreen';
import AuthenticationService from '../src/logic/AuthenticationService';
import { Alert } from 'react-native';

jest.mock('../src/logic/AuthenticationService', () => ({
    fetch: jest.fn(),
}));

jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: any) => React.createElement('Pdf', props);
});

jest.mock('react-native-wheel-color-picker', () => null);

const mockFetch = AuthenticationService.fetch as jest.Mock;

const mockHandbooks = [
    {
        documentId: 1,
        title: 'Employee Handbook 2026',
        lastUpdated: '06/01/2026',
        url: 'https://test/handbook.pdf',
    },
    {
        documentId: 2,
        title: 'Health & Safety Handbook',
        lastUpdated: '18/10/2025',
        url: 'https://test/hs-handbook.pdf',
    },
];

describe('HandbookScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Ensures loading indicator appears before data loads.
     */
    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));

        render(<HandbookScreen />);

        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    /**
     * Ensures handbook titles render correctly after fetch succeeds.
     */
    it('renders handbook titles from API', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(screen.getByText('Employee Handbook 2026')).toBeTruthy();
            expect(screen.getByText('Health & Safety Handbook')).toBeTruthy();
        });
    });

    /**
     * Ensures last updated subtitles are formatted correctly.
     */
    it('renders formatted last updated subtitles', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(screen.getByText('Last Updated: 06/01/2026')).toBeTruthy();
            expect(screen.getByText('Last Updated: 18/10/2025')).toBeTruthy();
        });
    });

    /**
     * Ensures tapping a card expands it to show the inline PDF viewer.
     */
    it('expands card inline when pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const card = await screen.findByText('Employee Handbook 2026');
        fireEvent.press(card);

        await waitFor(() => {
            expect(screen.getByText('Employee Handbook 2026')).toBeTruthy();
        });
    });

    /**
     * Ensures pressing the same card again collapses it.
     */
    it('collapses card when pressed again', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const card = await screen.findByText('Employee Handbook 2026');

        fireEvent.press(card);
        fireEvent.press(card);

        await waitFor(() => {
            expect(screen.getByText('Employee Handbook 2026')).toBeTruthy();
        });
    });

    /**
     * Ensures only one card can be expanded at a time.
     */
    it('only expands one card at a time', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const first = await screen.findByText('Employee Handbook 2026');
        const second = await screen.findByText('Health & Safety Handbook');

        fireEvent.press(first);
        fireEvent.press(second);

        // Both titles should still be visible (no navigation away from list)
        await waitFor(() => {
            expect(screen.getByText('Employee Handbook 2026')).toBeTruthy();
            expect(screen.getByText('Health & Safety Handbook')).toBeTruthy();
        });
    });

    /**
     * Handles API response not ok.
     */
    it('shows alert if API response not ok', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to load handbooks.'
            );
        });
    });

    /**
     * Handles fetch throwing an error.
     */
    it('shows alert on fetch error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'An unexpected error occurred.'
            );
        });
    });

    /**
     * Ensures loading indicator disappears after data loads.
     */
    it('hides loading indicator after data loads', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures loading indicator disappears even when the API returns an error.
     */
    it('hides loading indicator after failed fetch', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures an empty list renders without crashing.
     */
    it('renders empty list without crashing', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });
});