import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import RiskAssessments from '../src/screens/RiskAssessments';
import AuthenticationService from '../src/logic/AuthenticationService';

jest.mock('../src/logic/AuthenticationService', () => ({
    fetch: jest.fn(),
}));

jest.mock('react-native-wheel-color-picker', () => null);

const mockFetch = AuthenticationService.fetch as jest.Mock;

const mockAssessments = [
    {
        riskAssessmentId: 1,
        title: 'Workshop Risk Assessment',
        hazardCount: 3,
        created: '2025-01-01',
        hasDrafts: false,
    },
];

const mockDrafts = [
    {
        hazardId: 10,
        title: 'Loose Wiring',
        created: '2025-01-02',
        createdBy: 'John',
    },
];

describe('RiskAssessments', () => {

    const onViewHazards = jest.fn();
    const onStartAssessment = jest.fn();
    const onEditDraftHazard = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Loading indicator should appear initially
     */
    it('shows loading indicator initially', () => {
        mockFetch.mockReturnValue(new Promise(() => {}));

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    /**
     * Successful fetch renders assessments
     */
    it('renders risk assessments from API', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockAssessments,
        });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Workshop Risk Assessment')).toBeTruthy();
            expect(screen.getByText('Hazards: 3')).toBeTruthy();
        });
    });

    /**
     * Start Assessment button triggers callback
     */
    it('calls onStartAssessment when button pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        const button = await screen.findByText('Start New Assessment');

        fireEvent.press(button);

        expect(onStartAssessment).toHaveBeenCalledTimes(1);
    });

    /**
     * Clicking assessment card opens hazards
     */
    it('calls onViewHazards when assessment pressed', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockAssessments,
        });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        const card = await screen.findByText('Workshop Risk Assessment');

        fireEvent.press(card);

        expect(onViewHazards).toHaveBeenCalledWith(
            1,
            'Workshop Risk Assessment'
        );
    });

    /**
     * Switching to Drafts loads draft hazards
     */
    it('loads drafts when Drafts tab selected', async () => {

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockAssessments,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDrafts,
            });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await screen.findByText('Workshop Risk Assessment');

        fireEvent.press(screen.getByText('Drafts'));

        await waitFor(() => {
            expect(screen.getByText('Loose Wiring')).toBeTruthy();
        });
    });

    /**
     * Pressing draft card triggers edit draft callback
     */
    it('calls onEditDraftHazard when draft pressed', async () => {

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockAssessments,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockDrafts,
            });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await screen.findByText('Workshop Risk Assessment');

        fireEvent.press(screen.getByText('Drafts'));

        const draft = await screen.findByText('Loose Wiring');

        fireEvent.press(draft);

        expect(onEditDraftHazard).toHaveBeenCalledWith(10);
    });

    /**
     * Failed fetch shows error message
     */
    it('shows error when API response not ok', async () => {

        mockFetch.mockResolvedValueOnce({ ok: false });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load risk assessments.')).toBeTruthy();
        });
    });
    it('shows unexpected error if assessments fetch throws', async () => {

        mockFetch.mockRejectedValueOnce(new Error('Network'));

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred.')).toBeTruthy();
        });

    });

    it('shows error when drafts API response not ok', async () => {

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            })
            .mockResolvedValueOnce({
                ok: false,
            });

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await screen.findByText('Start New Assessment');

        fireEvent.press(screen.getByText('Drafts'));

        await waitFor(() => {
            expect(screen.getByText('Failed to load drafts.')).toBeTruthy();
        });

    });

    it('shows unexpected error if drafts fetch throws', async () => {

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [],
            })
            .mockRejectedValueOnce(new Error('Network'));

        render(
            <RiskAssessments
                onViewHazards={onViewHazards}
                onStartAssessment={onStartAssessment}
                onEditDraftHazard={onEditDraftHazard}
            />
        );

        await screen.findByText('Start New Assessment');

        fireEvent.press(screen.getByText('Drafts'));

        await waitFor(() => {
            expect(screen.getByText('An unexpected error occurred.')).toBeTruthy();
        });

    });

});