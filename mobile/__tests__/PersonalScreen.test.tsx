import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import PersonalScreen from '../src/screens/PersonalScreen';
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

const mockQualifications = [
    {
        title: 'First Aid Certificate',
        details: 'Valid until 2026',
        url: 'https://test/first-aid.pdf',
    },
    {
        title: 'Fire Safety Training',
        details: 'Completed in 2025',
        url: 'https://test/fire-safety.pdf',
    },
];

describe('PersonalScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));
        render(<PersonalScreen />);
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    it('renders qualifications from API', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(screen.getByText('First Aid Certificate')).toBeTruthy();
            expect(screen.getByText('Valid until 2026')).toBeTruthy();
            expect(screen.getByText('Fire Safety Training')).toBeTruthy();
            expect(screen.getByText('Completed in 2025')).toBeTruthy();
        });
    });

    it('opens PDF when a qualification is pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        // Press the first "View" button
        const viewButton = await screen.findAllByText('View');
        fireEvent.press(viewButton[0]);

        // The Back button confirms PDF screen is open
        expect(await screen.findByText('Back')).toBeTruthy();
    });

    it('returns to list when Back is pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        const viewButton = await screen.findAllByText('View');
        fireEvent.press(viewButton[0]);

        const backButton = await screen.findByText('Back');
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(screen.getByText('First Aid Certificate')).toBeTruthy();
            expect(screen.getByText('Fire Safety Training')).toBeTruthy();
        });
    });

    it('shows alert if API response not ok', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to load qualifications.'
            );
        });
    });

    it('shows alert on fetch error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Unexpected error.'
            );
        });
    });

    it('handles PDF loading error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        const { UNSAFE_getByType } = render(<PersonalScreen />);

        const viewButton = await screen.findAllByText('View');
        fireEvent.press(viewButton[0]);

        const PdfComponent: any = UNSAFE_getByType(Pdf);

        PdfComponent.props.onError('PDF failed');

        expect(consoleSpy).toHaveBeenCalledWith('PDF error:', 'PDF failed');
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to load PDF.');

        consoleSpy.mockRestore();
    });
});