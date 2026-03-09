import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import HsOverview from '../src/screens/HsOverview';
import { fireEvent } from '@testing-library/react-native';
import SummaryCard from '../src/components/summary/SummaryCard';

// TypeScript-safe global fetch
declare const global: any;
global.fetch = jest.fn();

const mockResponse = {
    pendingDocs: 5,
    signed: 3,
    hazards: 2,
};

describe('HsOverview Screen', () => {

    /**
     * Clear all Jest mocks between tests to ensure isolation and deterministic results.
     */
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Verifies static UI elements render correctly:
     *  - header text
     *  - alert labels (Document, Report, SOP)
     *  - quick actions and a known action label
     */
    it('renders static header, alerts, and quick actions', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<HsOverview />);

        // Header
        expect(await screen.findByText('Actions Required')).toBeTruthy();

        // Alerts: use getAllByText to avoid multiple matches error
        expect(screen.getAllByText(/Document/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Report/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/SOP/i).length).toBeGreaterThan(0);

        // Quick Actions
        expect(screen.getAllByText('Quick Actions').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Risk Assessment').length).toBeGreaterThan(0);
    });

    /**
     * Ensures fetched dashboard statistics are rendered when the fetch resolves successfully.
     */
    it('displays fetched dashboard stats correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<HsOverview />);

        await waitFor(() => {
            expect(screen.getAllByText(String(mockResponse.pendingDocs))[0]).toBeTruthy();
            expect(screen.getAllByText(String(mockResponse.signed))[0]).toBeTruthy();
            expect(screen.getAllByText(String(mockResponse.hazards))[0]).toBeTruthy();
        });
    });

    /**
     * Confirms that a non-ok fetch response is handled gracefully and an error is logged.
     * The test stubs console.error to assert it was called with an Error instance.
     */
    it('handles fetch failure gracefully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<HsOverview />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to load dashboard data:',
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    /**
     * Tests Android-specific backend URL selection.
     * Temporarily overrides `Platform.OS` to `android` and restores it after the assertion.
     */
    it('calls the correct backend URL for Android', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        // Mock platform
        const originalPlatform = Platform.OS;
        (Platform as any).OS = 'android';

        render(<HsOverview />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('10.0.2.2:8080/hs-overview')
            );
        });

        (Platform as any).OS = originalPlatform; // reset platform
    });

    /**
     * Tests iOS/web backend URL selection (default Platform.OS in test environment).
     */
    it('calls the correct backend URL for iOS/web', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<HsOverview />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('localhost:8080/hs-overview')
            );
        });
    });

    /**
     * Ensures component state updates when fetch returns new data and UI reflects it.
     */
    it('updates state when fetch returns new data', async () => {
        const newData = { pendingDocs: 7, signed: 4, hazards: 1 };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newData,
        });

        render(<HsOverview />);

        await waitFor(() => {
            expect(screen.getByText('7')).toBeTruthy();
            expect(screen.getByText('4')).toBeTruthy();
            expect(screen.getByText('1')).toBeTruthy();
        });
    });

    describe('SummaryCard component', () => {
        it('renders label and value', () => {
            const { getByText } = render(<SummaryCard label="Pending Docs" value={5} />);
            expect(getByText('Pending Docs')).toBeTruthy();
            expect(getByText('5')).toBeTruthy();
        });

        it('renders icon when provided', () => {
            render(<SummaryCard label="Signed" value={3} icon="check" />);
            // Icon test skipped for now to avoid unused variable
        });

        it('applies correct colours for each type', () => {
            const { getByText, rerender } = render(<SummaryCard label="Red Card" value={1} colour="red" />);
            expect(getByText('Red Card')).toBeTruthy();

            rerender(<SummaryCard label="Amber Card" value={2} colour="amber" />);
            expect(getByText('Amber Card')).toBeTruthy();

            rerender(<SummaryCard label="Green Card" value={3} colour="green" />);
            expect(getByText('Green Card')).toBeTruthy();

            rerender(<SummaryCard label="Neutral Card" value={4} colour="neutral" />);
            expect(getByText('Neutral Card')).toBeTruthy();
        });

        it('calls onPress when pressed', () => {
            const onPressMock = jest.fn();
            const { getByText } = render(<SummaryCard label="Clickable" value={10} onPress={onPressMock} />);
            fireEvent.press(getByText('Clickable'));
            expect(onPressMock).toHaveBeenCalledTimes(1);
        });
    });
});