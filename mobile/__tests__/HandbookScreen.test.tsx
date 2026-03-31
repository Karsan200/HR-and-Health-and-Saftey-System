import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import HandbookScreen from '../src/screens/HandbookScreen';
import AuthenticationService from '../src/logic/AuthenticationService';
import { Alert } from 'react-native';
import Pdf from 'react-native-pdf';

jest.mock('../src/logic/AuthenticationService', () => ({
    fetch: jest.fn(),
}));

jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: any) => React.createElement('Pdf', props);
});

const mockFetch = AuthenticationService.fetch as jest.Mock;

const mockHandbooks = [
    {
        documentId: 1,
        title: 'Employee Handbook 2026',
        url: 'https://test/handbook.pdf',
    },
    {
        documentId: 2,
        title: 'Health & Safety Handbook',
        url: 'https://test/hs-handbook.pdf',
    },
];

describe('HandbookScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));
        render(<HandbookScreen />);
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    it('renders handbooks after fetch', async () => {
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

    it('opens PDF when a handbook is pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const handbookItem = await screen.findByText('Employee Handbook 2026');
        fireEvent.press(handbookItem);

        expect(await screen.findByText('Back')).toBeTruthy();
    });

    it('returns to list when Back is pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const handbookItem = await screen.findByText('Employee Handbook 2026');
        fireEvent.press(handbookItem);

        const backButton = await screen.findByText('Back');
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(screen.getByText('Employee Handbook 2026')).toBeTruthy();
        });
    });

    it('shows alert if fetch fails', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({
            ok: false,
        });

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to load handbooks.');
        });
    });

    it('shows alert on fetch error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<HandbookScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Error', 'An unexpected error occurred.');
        });
    });

    it('handles PDF load error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        const { UNSAFE_getByType } = render(<HandbookScreen />);

        const handbookItem = await screen.findByText('Employee Handbook 2026');
        fireEvent.press(handbookItem);

        const PdfComponent: any = UNSAFE_getByType(Pdf);
        PdfComponent.props.onError('PDF failed');

        expect(consoleSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to load PDF.');

        consoleSpy.mockRestore();
    });
});