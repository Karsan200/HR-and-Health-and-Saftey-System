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
    return (props: any) => React.createElement('Pdf', props);
});

jest.mock('react-native-wheel-color-picker', () => null);

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

const mockDrivingLicence = {
    title: 'Driving Licence',
    extension: 'jpg',
    url: 'https://test/licence.jpg',
};

describe('PersonalScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Ensures loading indicator appears before data loads.
     */
    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));
        render(<PersonalScreen />);
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    /**
     * Ensures loading indicator disappears after data loads.
     */
    it('hides loading indicator after data loads', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures loading indicator disappears even when the API returns an error.
     */
    it('hides loading indicator after failed fetch', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures qualifications render correctly after fetch succeeds.
     */
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

    /**
     * Ensures an empty qualifications list renders without crashing.
     */
    it('renders empty qualifications list without crashing', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures qualification tab is active by default.
     */
    it('shows qualifications tab as active by default', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        await waitFor(() => {
            expect(screen.getByText('Qualifications')).toBeTruthy();
            expect(screen.getByText('First Aid Certificate')).toBeTruthy();
        });
    });

    /**
     * Ensures the PDF viewer opens when a qualification View button is pressed.
     */
    it('opens PDF viewer when a qualification View button is pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        const viewButtons = await screen.findAllByText('View');
        fireEvent.press(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('pdf-back-button')).toBeTruthy();
            expect(screen.getByText('First Aid Certificate')).toBeTruthy();
        });
    });

    /**
     * Ensures pressing back from the PDF viewer returns to the qualifications list.
     */
    it('returns to qualifications list when back is pressed from PDF viewer', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        render(<PersonalScreen />);

        const viewButtons = await screen.findAllByText('View');
        fireEvent.press(viewButtons[0]);

        const backButton = await screen.findByTestId('pdf-back-button');
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(screen.getByText('First Aid Certificate')).toBeTruthy();
            expect(screen.getByText('Fire Safety Training')).toBeTruthy();
        });
    });

    /**
     * Ensures PDF onError triggers console.error and Alert.
     */
    it('handles PDF loading error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockQualifications,
        });

        const { UNSAFE_getByType } = render(<PersonalScreen />);

        const viewButtons = await screen.findAllByText('View');
        fireEvent.press(viewButtons[0]);

        const pdfComponent: any = UNSAFE_getByType(Pdf);
        pdfComponent.props.onError('PDF failed');

        expect(consoleSpy).toHaveBeenCalledWith('PDF error:', 'PDF failed');
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to load PDF.');

        consoleSpy.mockRestore();
    });

    /**
     * Ensures alert shown if qualifications API response is not ok.
     */
    it('shows alert if qualifications API response is not ok', async () => {
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

    /**
     * Ensures alert shown if qualifications fetch throws.
     */
    it('shows alert on qualifications fetch error', async () => {
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

    /**
     * Ensures switching to Driving License tab fetches the licence.
     */
    it('fetches driving licence when Driving License tab is pressed', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockQualifications,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDrivingLicence,
            });

        render(<PersonalScreen />);

        await waitFor(() => screen.getByText('First Aid Certificate'));

        fireEvent.press(screen.getByText('Driving License'));

        await waitFor(() => {
            expect(screen.getByText('Driving Licence')).toBeTruthy();
        });
    });

    /**
     * Ensures the image viewer opens when the driving licence View button is pressed.
     */
    it('opens image viewer when driving licence View button is pressed', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockQualifications,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDrivingLicence,
            });

        render(<PersonalScreen />);

        await waitFor(() => screen.getByText('First Aid Certificate'));

        fireEvent.press(screen.getByText('Driving License'));

        const viewButton = await screen.findByText('View');
        fireEvent.press(viewButton);

        await waitFor(() => {
            expect(screen.getByTestId('licence-back-button')).toBeTruthy();
        });
    });

    /**
     * Ensures pressing back from the image viewer returns to the driving licence tab.
     */
    it('returns to driving licence tab when back is pressed from image viewer', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockQualifications,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDrivingLicence,
            });

        render(<PersonalScreen />);

        await waitFor(() => screen.getByText('First Aid Certificate'));

        fireEvent.press(screen.getByText('Driving License'));

        const viewButton = await screen.findByText('View');
        fireEvent.press(viewButton);

        const backButton = await screen.findByTestId('licence-back-button');
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(screen.getByText('Driving Licence')).toBeTruthy();
        });
    });

    /**
     * Ensures "No driving licence on record" is shown when API returns 404.
     */
    it('shows no licence message when API returns 404', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockQualifications,
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

        render(<PersonalScreen />);

        await waitFor(() => screen.getByText('First Aid Certificate'));

        fireEvent.press(screen.getByText('Driving License'));

        await waitFor(() => {
            expect(screen.getByText('No driving licence on record.')).toBeTruthy();
        });
    });

    /**
     * Ensures error message shown when driving licence fetch fails.
     */
    it('shows error message when driving licence fetch fails', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockQualifications,
            })
            .mockResolvedValueOnce({ ok: false, status: 500 });

        render(<PersonalScreen />);

        await waitFor(() => screen.getByText('First Aid Certificate'));

        fireEvent.press(screen.getByText('Driving License'));

        await waitFor(() => {
            expect(screen.getByText('Failed to load driving licence.')).toBeTruthy();
        });
    });

    /**
     * Ensures switching back to qualifications tab shows the list again.
     */
    it('switches back to qualifications list when Qualifications tab is pressed', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockQualifications,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDrivingLicence,
            });

        render(<PersonalScreen />);

        await waitFor(() => screen.getByText('First Aid Certificate'));

        fireEvent.press(screen.getByText('Driving License'));
        fireEvent.press(screen.getByText('Qualifications'));

        await waitFor(() => {
            expect(screen.getByText('First Aid Certificate')).toBeTruthy();
            expect(screen.getByText('Fire Safety Training')).toBeTruthy();
        });
    });
});