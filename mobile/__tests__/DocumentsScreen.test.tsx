import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import DocumentsScreen from '../src/screens/DocumentsScreen';
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

const mockDocuments = [
    {
        documentId: 1,
        title: 'Fire Safety Policy v2.0',
        url: 'https://test/fire.pdf',
        signed: false,
    },
    {
        documentId: 2,
        title: 'SOP: Engine Handling Instructions v1.5',
        url: 'https://test/sop.pdf',
        signed: false,
    },
    {
        documentId: 3,
        title: 'Workshop Rules v1.1',
        url: 'https://test/workshop.pdf',
        signed: true,
    },
];

describe('DocumentsScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Ensures loading indicator appears before data loads.
     */
    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));

        render(<DocumentsScreen />);

        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    /**
     * Ensures loading indicator disappears after data loads.
     */
    it('hides loading indicator after data loads', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Ensures loading indicator disappears even on error.
     */
    it('hides loading indicator after failed fetch', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });

    /**
     * Successful fetch renders documents with stripped titles.
     */
    it('renders documents from API with display titles', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            // SOP prefix and version should be stripped from display title
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
            expect(screen.getByText('Workshop Rules')).toBeTruthy();
        });
    });

    /**
     * Ensures version numbers are shown in the subtitle.
     */
    it('renders version in subtitle', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Safety • Version 2.0')).toBeTruthy();
        });
    });

    /**
     * Ensures documents with no version default to 1.0 in subtitle.
     */
    it('defaults to version 1.0 when no version in title', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{
                documentId: 4,
                title: 'Emergency Procedures',
                url: 'https://test/emergency.pdf',
                signed: false,
            }],
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Safety • Version 1.0')).toBeTruthy();
        });
    });

    /**
     * Filters to SOP documents when SOP button pressed.
     */
    it('filters SOP documents when SOP button pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
        });

        fireEvent.press(screen.getByText('SOPs/\nInstructions'));

        await waitFor(() => {
            expect(screen.getByText('Engine Handling Instructions')).toBeTruthy();
            expect(screen.queryByText('Fire Safety Policy')).toBeNull();
        });
    });

    /**
     * Filters to signed documents when Signed pill pressed.
     */
    it('filters to signed documents when Signed pill pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
        });

        fireEvent.press(screen.getAllByText('Signed')[0]);

        await waitFor(() => {
            expect(screen.getByText('Workshop Rules')).toBeTruthy();
            expect(screen.queryByText('Fire Safety Policy')).toBeNull();
        });
    });

    /**
     * Filters to unsigned documents when Awaiting Signature pill pressed.
     */
    it('filters to awaiting documents when Awaiting Signature pill pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
        });

        fireEvent.press(screen.getByText('Awaiting Signature'));

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
            expect(screen.queryByText('Workshop Rules')).toBeNull();
        });
    });

    /**
     * Opens document PDF viewer when button pressed.
     */
    it('opens PDF viewer when Review & Sign pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        const button = await screen.findAllByText('Review & Sign');
        fireEvent.press(button[0]);

        await waitFor(() => {
            expect(screen.getByTestId('documentAcknowledgedCheckbox')).toBeTruthy();
        });
    });

    /**
     * Back arrow in PDF viewer returns to document list.
     */
    it('returns to list when back arrow pressed in PDF viewer', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        const button = await screen.findAllByText('Review & Sign');
        fireEvent.press(button[0]);

        await waitFor(() => {
            expect(screen.getByTestId('documentAcknowledgedCheckbox')).toBeTruthy();
        });

        // Press the back button (arrow-left icon container)
        const backButton = screen.getByTestId('pdf-back-button');
        fireEvent.press(backButton);

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
        });
    });

    /**
     * Checkbox signs document and calls sign API.
     */
    it('signs document when checkbox pressed', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDocuments,
            })
            .mockResolvedValueOnce({
                ok: true,
            });

        render(<DocumentsScreen />);

        const button = await screen.findAllByText('Review & Sign');
        fireEvent.press(button[0]);

        const checkbox = await screen.findByTestId('documentAcknowledgedCheckbox');
        fireEvent.press(checkbox);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/documents/1/sign',
                { method: 'POST' }
            );
        });
    });

    /**
     * Sign API failure shows alert.
     */
    it('shows alert if signing fails', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDocuments,
            })
            .mockResolvedValueOnce({
                ok: false,
            });

        render(<DocumentsScreen />);

        const button = await screen.findAllByText('Review & Sign');
        fireEvent.press(button[0]);

        const checkbox = await screen.findByTestId('documentAcknowledgedCheckbox');
        fireEvent.press(checkbox);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to sign document.'
            );
        });
    });

    /**
     * Sign API network error shows alert.
     */
    it('shows alert if signing throws error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDocuments,
            })
            .mockRejectedValueOnce(new Error('Network'));

        render(<DocumentsScreen />);

        const button = await screen.findAllByText('Review & Sign');
        fireEvent.press(button[0]);

        const checkbox = await screen.findByTestId('documentAcknowledgedCheckbox');
        fireEvent.press(checkbox);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Unexpected error.'
            );
        });
    });

    /**
     * Failed fetch response shows alert.
     */
    it('shows alert if API response not ok', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({ ok: false });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to load documents.'
            );
        });
    });

    /**
     * Network error shows alert.
     */
    it('shows alert on fetch error', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockRejectedValueOnce(new Error('Network'));

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Unexpected error.'
            );
        });
    });

    /**
     * Empty list renders without crashing.
     */
    it('renders empty list without crashing', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).toBeNull();
        });
    });
});