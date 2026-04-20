import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import HazardView from '../src/screens/HazardView';
import AuthenticationService from '../src/logic/AuthenticationService';
import { ThemeContext } from '../src/theme/colourController';

jest.mock('../src/logic/AuthenticationService');
jest.mock('react-native-wheel-color-picker', () => () => null);

const renderWithTheme = (ui: React.ReactElement) =>
    render(
        <ThemeContext.Provider
            value={{
                theme: { redPrimary: 'red', greyIconLight: 'grey' } as any,
                accessibility: {} as any,
                updateTheme: () => {},
                updateAccessibility: () => {},
            }}
        >
            {ui}
        </ThemeContext.Provider>
    );

const mockHazard = {
    hazardId: 1,
    title: 'Test Hazard',
    questionOne: 'Hazard Q1',
    questionTwo: 'Hazard Q2',
    questionThree: 'Hazard Q3',
    questionFour: 'Hazard Q4',
    questionFive: 'Hazard Q5',
    questionSix: '2026-04-09T12:00:00Z',
    draft: false,
    closed: false,
    createdBy: 'Alice',
    created: '2026-04-09T12:00:00Z',
    fileUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
};

describe('HazardView', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading indicator initially', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazard,
        });

        const { getByTestId } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('renders error when fetch fails with ok=false', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: false });

        const { getByText } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);

        await waitFor(() => {
            expect(getByText('Failed to load hazard report.')).toBeTruthy();
        });
    });

    it('renders error when fetch throws', async () => {
        (AuthenticationService.fetch as jest.Mock).mockRejectedValue(new Error('network error'));

        const { getByText } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);

        await waitFor(() => {
            expect(getByText('An unexpected error occurred.')).toBeTruthy();
        });
    });

    it('renders all hazard fields', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazard,
        });

        const { getByText } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);

        await waitFor(() => {
            expect(getByText('Assessment Title')).toBeTruthy();
            expect(getByText('Test Hazard')).toBeTruthy();
            expect(getByText('What are the hazards?')).toBeTruthy();
            expect(getByText('Hazard Q1')).toBeTruthy();
            expect(getByText('09/04/2026')).toBeTruthy();
        });
    });

    it('renders attached photos', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazard,
        });

        const { getAllByTestId } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);

        await waitFor(() => {
            const images = getAllByTestId(/hazard-photo-/);
            expect(images.length).toBe(2);
        });
    });

    it('checkbox can be pressed for incomplete hazard', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockHazard,
        });

        const { getByTestId, getByText } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);
        await waitFor(() => getByText('Action completed'));

        await act(async () => {
            const checkbox = getByTestId('action-checkbox');
            (AuthenticationService.fetch as jest.Mock).mockResolvedValue({ ok: true }); // PATCH success
            fireEvent.press(checkbox);
        });

        await waitFor(() => {
            expect(AuthenticationService.fetch).toHaveBeenCalledWith(
                '/api/risk-assessment/hazard/1/complete',
                { method: 'PATCH' }
            );
        });
    });

    it('checkbox is disabled and checked if hazard is closed', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ ...mockHazard, closed: true }),
        });

        const { getByTestId, getByText } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);
        await waitFor(() => getByText('Action completed'));

        await act(async () => {
            const checkbox = getByTestId('action-checkbox');
            fireEvent.press(checkbox);
        });

        expect(AuthenticationService.fetch).toHaveBeenCalledTimes(1); // Only the initial GET
    });

    it('logs an error if PATCH fails with non-ok response', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockHazard,
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByTestId } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);
        await waitFor(() => getByTestId('action-checkbox'));

        // Simulate PATCH returning non-ok
        (AuthenticationService.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        fireEvent.press(getByTestId('action-checkbox'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to complete hazard action:',
                500
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it('logs an error if PATCH throws', async () => {
        (AuthenticationService.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockHazard,
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const { getByTestId } = renderWithTheme(<HazardView hazardId={1} onBack={jest.fn()} />);
        await waitFor(() => getByTestId('action-checkbox'));

        // Simulate network error
        (AuthenticationService.fetch as jest.Mock).mockRejectedValueOnce(new Error('network fail'));

        fireEvent.press(getByTestId('action-checkbox'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error completing hazard action:',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });
});