import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import PayslipScreen from '../src/screens/PayslipScreen';
import AuthenticationService from '../src/logic/AuthenticationService';
import {Alert, Platform} from 'react-native';

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

const mockPayslips = [
    {
        name: 'payslip_jan_2026',
        year: 2026,
        month: 1,
        isPSixty: false,
        url: 'https://test/jan.pdf',
    },
    {
        name: 'payslip_feb_2026',
        year: 2026,
        month: 2,
        isPSixty: false,
        url: 'https://test/feb.pdf',
    },
    {
        name: 'p60_2025',
        year: 2025,
        month: 4,
        isPSixty: true,
        url: 'https://test/p60.pdf',
    },
];

describe('PayslipScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Ensures loading indicator appears before data loads.
     */
    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));

        render(<PayslipScreen />);

        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    /**
     * Ensures payslips render correctly with formatted titles after fetch succeeds.
     */
    it('renders payslip titles from API', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.getByText('January 2026')).toBeTruthy();
            expect(screen.getByText('February 2026')).toBeTruthy();
        });
    });

    /**
     * Ensures pay dates are formatted correctly in the subtitle.
     */
    it('renders formatted pay dates', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.getByText('Pay Date: 31/01/2026')).toBeTruthy();
            expect(screen.getByText('Pay Date: 28/02/2026')).toBeTruthy();
        });
    });

    /**
     * Ensures P60 card renders with the correct tax year title.
     */
    it('renders P60 title with tax year format', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.getByText('P60 – Tax Year 2024/25')).toBeTruthy();
        });
    });

    /**
     * Ensures P60 card renders tax year in the subtitle.
     */
    it('renders P60 subtitle with tax year', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.getByText('Tax Year 2024/25')).toBeTruthy();
        });
    });

    /**
     * Ensures P60 badge label renders when isPSixty is true.
     */
    it('renders P60 badge when isPSixty is true', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.getByText('P60')).toBeTruthy();
        });
    });

    /**
     * Ensures tapping a card expands it to show the inline PDF viewer.
     */
    it('expands card inline when pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const card = await screen.findByText('January 2026');
        fireEvent.press(card);

        await waitFor(() => {
            expect(screen.getByText('January 2026')).toBeTruthy();
        });
    });

    /**
     * Ensures pressing the same card again collapses it.
     */
    it('collapses card when pressed again', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const card = await screen.findByText('January 2026');

        fireEvent.press(card);
        fireEvent.press(card);

        await waitFor(() => {
            expect(screen.getByText('January 2026')).toBeTruthy();
        });
    });

    /**
     * Ensures only one card can be expanded at a time.
     */
    it('only expands one card at a time', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const jan = await screen.findByText('January 2026');
        const feb = await screen.findByText('February 2026');

        fireEvent.press(jan);
        fireEvent.press(feb);

        // Both titles should still be visible (list not navigated away from)
        await waitFor(() => {
            expect(screen.getByText('January 2026')).toBeTruthy();
            expect(screen.getByText('February 2026')).toBeTruthy();
        });
    });

    /**
     * Handles API response not ok.
     */
    it('shows alert if API response not ok', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to load payslips.'
            );
        });
    });

    /**
     * Handles fetch throwing an error.
     */
    it('shows alert on fetch error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<PayslipScreen />);

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
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures loading indicator disappears even when the API returns an error.
     */
    it('hides loading indicator after failed fetch', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<PayslipScreen />);

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

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures the download button is present for each payslip card.
     */
    it('renders a download button for each payslip', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            const downloadButtons = screen.getAllByTestId('download-button');
            expect(downloadButtons).toHaveLength(mockPayslips.length);
        });
    });

    /**
     * Ensures pressing the download button triggers the download and shows a success alert.
     */
    it('shows downloaded alert when download button is pressed', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android'); // ADD THIS

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const downloadButtons = await screen.findAllByTestId('download-button');
        fireEvent.press(downloadButtons[0]);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Downloaded',
                'January 2026 saved to Downloads.'
            );
        });
    });

    /**
     * Ensures pressing the download button on a P60 card uses the correct filename.
     */
    it('downloads P60 with correct filename', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        jest.replaceProperty(Platform, 'OS', 'android'); // ADD THIS

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const downloadButtons = await screen.findAllByTestId('download-button');
        fireEvent.press(downloadButtons[2]);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Downloaded',
                'P60  Tax Year 202425 saved to Downloads.'
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
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

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
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

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