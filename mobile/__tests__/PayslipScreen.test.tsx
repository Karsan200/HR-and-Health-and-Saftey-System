import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import PayslipScreen from '../src/screens/PayslipScreen';
import AuthenticationService from '../src/logic/AuthenticationService';
import { Alert } from 'react-native';
import Pdf from 'react-native-pdf';

jest.mock('../src/logic/AuthenticationService', () => ({
    fetch: jest.fn(),
}));

jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: any) => {
        return React.createElement('Pdf', props);
    };
});

const mockFetch = AuthenticationService.fetch as jest.Mock;

const mockPayslips = [
    {
        name: 'January Payslip',
        year: 2026,
        month: 1,
        isPSixty: false,
        url: 'https://test/jan.pdf',
    },
    {
        name: 'P60 Document',
        year: 2025,
        month: 12,
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
     * Ensures payslips render when fetch succeeds.
     */
    it('renders payslips from API', async () => {

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        await waitFor(() => {
            expect(screen.getByText('January Payslip')).toBeTruthy();
            expect(screen.getByText('1/2026')).toBeTruthy();
        });
    });

    /**
     * Ensures P60 label renders when isPSixty = true.
     */
    it('renders P60 label when applicable', async () => {

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
     * Ensures pressing a payslip opens the PDF viewer.
     */
    it('opens PDF when payslip pressed', async () => {

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const item = await screen.findByText('January Payslip');

        fireEvent.press(item);

        expect(await screen.findByText('Back')).toBeTruthy();
    });

    /**
     * Ensures back button returns to the list.
     */
    it('returns to list when Back pressed', async () => {

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        render(<PayslipScreen />);

        const item = await screen.findByText('January Payslip');
        fireEvent.press(item);

        const backButton = await screen.findByText('Back');
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(screen.getByText('January Payslip')).toBeTruthy();
        });
    });

    /**
     * Handles API response not ok.
     */
    it('shows alert if API response not ok', async () => {

        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({
            ok: false,
        });

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
     * Handles PDF load error.
     */
    it('handles PDF loading error', async () => {

        const alertSpy = jest.spyOn(Alert, 'alert');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPayslips,
        });

        const { UNSAFE_getByType } = render(<PayslipScreen />);

        const item = await screen.findByText('January Payslip');
        fireEvent.press(item);

        const PdfComponent: any = UNSAFE_getByType(Pdf);

        PdfComponent.props.onError('PDF failed');

        expect(consoleSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith(
            'Error',
            'Failed to load PDF.'
        );

        consoleSpy.mockRestore();
    });

});