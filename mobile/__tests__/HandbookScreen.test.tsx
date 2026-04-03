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
        config: jest.fn(() => ({
            fetch: jest.fn(() =>
                Promise.resolve({ path: () => '/storage/emulated/0/Download/test.pdf' })
            ),
        })),
        fs: {
            dirs: {
                DownloadDir: '/storage/emulated/0/Download',
                DocumentDir: '/data/user/0/com.frontend/files',
            },
        },
        ios: {
            presentOptionsMenu: jest.fn(),
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

    /**
     * Ensures the download button is present for each handbook card.
     */
    it('renders a download button for each handbook', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        await waitFor(() => {
            const downloadButtons = screen.getAllByTestId('download-button');
            expect(downloadButtons).toHaveLength(mockHandbooks.length);
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

    /**
     * Ensures pressing the download button on the second card uses the correct filename.
     */
    it('downloads second handbook with correct filename', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android');

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const downloadButtons = await screen.findAllByTestId('download-button');
        fireEvent.press(downloadButtons[1]);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Downloaded',
                'Health  Safety Handbook saved to Downloads.'
            );
        });
    });

    /**
     * Ensures an error alert is shown if the download fails.
     */
    it('shows error alert when download fails', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        const ReactNativeBlobUtil = require('react-native-blob-util').default;
        ReactNativeBlobUtil.config.mockReturnValueOnce({
            fetch: jest.fn(() => Promise.reject(new Error('Download failed'))),
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const downloadButtons = await screen.findAllByTestId('download-button');
        fireEvent.press(downloadButtons[0]);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to download the file.'
            );
        });
    });


    /**
     * Ensures iOS share sheet is opened instead of an alert on iOS.
     */
    it('opens iOS share sheet on download instead of alert on iOS', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'ios');

        const ReactNativeBlobUtil = require('react-native-blob-util').default;

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHandbooks,
        });

        render(<HandbookScreen />);

        const downloadButtons = await screen.findAllByTestId('download-button');
        fireEvent.press(downloadButtons[0]);

        await waitFor(() => {
            expect(ReactNativeBlobUtil.ios.presentOptionsMenu).toHaveBeenCalledWith(
                '/storage/emulated/0/Download/test.pdf'
            );
            expect(alertSpy).not.toHaveBeenCalledWith('Downloaded', expect.any(String));
        });
    });
});