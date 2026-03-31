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

const mockFetch = AuthenticationService.fetch as jest.Mock;

const mockDocuments = [
    {
        documentId: 1,
        title: 'Fire Safety Policy',
        url: 'https://test/fire.pdf',
        signed: false,
    },
    {
        documentId: 2,
        title: 'Engine SOP',
        url: 'https://test/sop.pdf',
        signed: false,
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
     * Successful fetch renders documents
     */
    it('renders documents from API', async () => {

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
        });
    });

    /**
     * Failed fetch response
     */
    it('shows alert if API response not ok', async () => {

        const alertSpy = jest.spyOn(Alert, 'alert');

        mockFetch.mockResolvedValueOnce({
            ok: false,
        });

        render(<DocumentsScreen />);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Failed to load documents.'
            );
        });
    });

    /**
     * Network error
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
     * Filter to SOP documents
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

        fireEvent.press(screen.getByText('SOPs and Instructions'));

        expect(screen.getByText('Engine SOP')).toBeTruthy();
    });

    /**
     * Opens a document
     */
    it('opens a document when pressed', async () => {

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        const doc = await screen.findByText('Fire Safety Policy');

        fireEvent.press(doc);

        expect(await screen.findByText('Back')).toBeTruthy();
    });

    /**
     * Back button returns to list
     */
    it('returns to list when back pressed', async () => {

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockDocuments,
        });

        render(<DocumentsScreen />);

        const doc = await screen.findByText('Fire Safety Policy');

        fireEvent.press(doc);

        const back = await screen.findByText('Back');
        fireEvent.press(back);

        await waitFor(() => {
            expect(screen.getByText('Fire Safety Policy')).toBeTruthy();
        });
    });

    /**
     * Checkbox signs document
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

        const doc = await screen.findByText('Fire Safety Policy');
        fireEvent.press(doc);

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
     * Sign API failure
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

        const doc = await screen.findByText('Fire Safety Policy');
        fireEvent.press(doc);

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
     * Sign API network error
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

        const doc = await screen.findByText('Fire Safety Policy');
        fireEvent.press(doc);

        const checkbox = await screen.findByTestId('documentAcknowledgedCheckbox');

        fireEvent.press(checkbox);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(
                'Error',
                'Unexpected error.'
            );
        });
    });

});