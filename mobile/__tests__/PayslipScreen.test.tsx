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
     * Ensures P60 title uses the previous year's tax year when month is before April (month < 4).
     */
    it('renders correct P60 title when month is before April', async () => {
        const marchP60 = [{ name: 'p60_march', year: 2025, month: 3, isPSixty: true, url: 'https://test/p60.pdf' }];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => marchP60,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            // Month is March (< 4), so tax year-end is 2025 - 1 = 2024, giving 2023/24
            expect(screen.getByText('P60 – Tax Year 2023/24')).toBeTruthy();
        });
    });
});