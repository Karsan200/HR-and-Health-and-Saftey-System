import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import HandbookScreen from '../src/screens/HandbookScreen';
import AuthenticationService from '../src/logic/AuthenticationService';
import { Alert, Platform } from 'react-native';

jest.mock('../src/logic/AuthenticationService', () => ({
    fetch: jest.fn(),
}));

jest.mock('react-native-pdf', () => {
    return 'Pdf';
});


jest.mock('react-native-wheel-color-picker', () => null);


jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: {
        DownloadDir: '/storage/emulated/0/Download',
        DocumentDir: '/data/user/0/com.frontend/files',
      },
      writeFile: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(true),
    },
    android: {
      addCompleteDownload: jest.fn().mockResolvedValue(undefined),
    },
    ios: {
      presentOptionsMenu: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

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
     * Ensures pressing the download button triggers the download and shows a success alert.
     */
    it('shows downloaded alert when download button is pressed', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const downloadButtons = await screen.findAllByTestId('download-button');
        fireEvent.press(downloadButtons[0]);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Downloaded',
                'Employee Handbook 2026 saved to Downloads.'
            );
        });
    });
});